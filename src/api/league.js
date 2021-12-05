const tedious = require('tedious');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');
const databaseUtils = require('../utils/database');
const validator = require('../utils/validator');
const crypto = require('crypto');

function generateHash(connection) {
  const newHash = crypto.randomBytes(8).toString('hex');
  return new Promise((resolve, reject) => {
    databaseUtils.requestWithConnection(connection, 'SELECT ID FROM Leagues WHERE Hash=@hash', 0, [
      {
        name: 'hash',
        type: tedious.TYPES.NVarChar,
        value: newHash
      }
    ])
      .then(data => {
        if (data.length === 0) {
          resolve(newHash)
        } else {
          generateHash(connection)
            .then(value => {
              resolve(value);
            })
            .catch(err => reject(err))
        }
      })
  })
}

function getUserLeagues(req, res){
  return new Promise((resolve, reject) => {
    const jwtToken = req.signedCookies.DLAccess;
    roleUtils.getUserInfo(jwtToken)
      .then((userData) => {
        databaseUtils.request('SELECT * FROM UserAndLeagues WHERE UserID=@UserID', 0, [
          { name: "UserID", type: tedious.TYPES.Int, value: userData.id }
        ])
          .then((data) => {
            const responseData = data.map(values => ({
              id: values.LeagueID.value,
              name: values.LeagueName.value,
              description: values.LeagueDescription.value,
              roleId: values.LeagueRoleID.value,
              role: values.LeagueRole.value
            }));
            res.status(200).json(responseData);
            resolve();
          })
          .catch(err => {
            res.status(500).send(err);
            reject();
          })
      })
      .catch(err => {
        res.status(500).send(err);
        reject();
      })
  });
}

function getQueen(req, res){
  return new Promise((resolve, reject) => {
    const queenID = req.params.queenID;
    if (queenID === null || queenID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT * FROM WeeklyQueenScores WHERE LeagueID=@LeagueID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: queenID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            episodeID: values.EpisodeID.value,
            episodeNumber: values.EpisodeNumber.value,
            queenID: values.QueenID.value,
            queenName: values.QueenName.value,
            points: values.Points.value
          }));

          res.status(200).json(responseData);
          resolve();
        })
        .catch(err => {
          res.status(500).send(err);
          reject();
        })
    }
  })
}

function registerApi(app) {
  app.get('/api/leagues', getUserLeagues)

  app.get('/api/league/:queenID/queens', apiUtils.getItemID(), getQueen);

  app.get('/api/league/:leagueID', apiUtils.getItemID(), (req, res) => {
    const leagueID = req.params.itemID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
    } else {
      databaseUtils.request('SELECT ID, Name, Description FROM Leagues WHERE ID=@ID AND Enabled=1', 0, [
        { name: "ID", type: tedious.TYPES.Int, value: leagueID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            id: values.ID.value,
            name: values.Name.value,
            description: values.Description.value
          }))
          res.status(200).json(responseData);
        })
    }
  })

  app.post('/api/league', roleUtils.authorize(['User']), (req, res) => {
    const data = req.body;
    const userID = res.locals.userID;

    if (!data || data === {})
      return res.status(400).json(apiUtils.generateError(400));

    const errors = validator.validate(data, validator.types.newLeague);
    if (errors)
      return res.status(400).json(apiUtils.generateError(400, { errors }));

    databaseUtils.connect()
      .then(connection => {
        connection.transaction((newTransactionError, doneTransaction) => {
          if (newTransactionError)
            return res.status(500).json(apiUtils.generateError(500));

          generateHash(connection)
            .then(newHash => {
              databaseUtils.requestWithConnection(connection, 'INSERT INTO Leagues(Name, Description, Hash, Enabled, Created) OUTPUT INSERTED.ID VALUES (@name, @description, @hash, 1, @created)', 0, [
                {
                  name: "name",
                  type: tedious.TYPES.NVarChar,
                  value: data.name
                },
                {
                  name: "description",
                  type: tedious.TYPES.NVarChar,
                  value: data.description || null
                },
                {
                  name: "hash",
                  type: tedious.TYPES.NVarChar,
                  value: newHash
                },
                {
                  name: "created",
                  type: tedious.TYPES.DateTime,
                  value: new Date()
                }
              ])
                .then((newLeagueData) => {
                  const newId = newLeagueData[0].ID.value;
                  const bulkLoad = connection.newBulkLoad('UserLeagues', (loadError, loadRows) => {
                    if (loadError || loadRows === 0) {
                      console.error('Error loading bulk rows for new league', loadError);
                      doneTransaction("Error loading bulk rows for new league", err => {
                        res.status(500).json(apiUtils.generateError(500, "Error loading bulk rows for new league", err));
                      });
                    } else {
                      doneTransaction(null, (transactionError) => {
                        if (transactionError)
                          return res.status(500).json(apiUtils.generateError(500, transactionError.message));
                        res.status(200).json(newId);
                      })
                    }
                  })

                  bulkLoad.addColumn('LeagueID', tedious.TYPES.Int, { nullable: false });
                  bulkLoad.addColumn('UserID', tedious.TYPES.Int, { nullable: false });
                  bulkLoad.addColumn('RoleID', tedious.TYPES.Int, { nullable: false });

                  bulkLoad.addRow(newId, userID, 3);

                  data.users.forEach(v => {
                    if(v.user !== userID)
                      bulkLoad.addRow(newId, v.user, v.role);
                  })

                  connection.execBulkLoad(bulkLoad);
                })
                .catch(leagueError => {
                  if (leagueError) {
                    console.error('Error creating new league', leagueError);
                  }
                  doneTransaction("Error creating new league", () => {
                    res.status(500).json(apiUtils.generateError(500, leagueError));
                  });
                })
            })
        }, tedious.ISOLATION_LEVEL.REPEATABLE_READ)
      })
  })
}

module.exports = {
  name: "League API",
  registerApi,
  methods: {
    getUserLeagues,
    getQueen
  }
}