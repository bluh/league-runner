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

function registerApi(app) {
  app.get('/api/leagues', (req, res) => {
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
            }))
            res.status(200).json(responseData);
          })
      })
      .catch(err => {
        res.status(500).send(err);
      })
  })

  app.get('/api/league/*/queens', apiUtils.getItemID(), (req, res) => {
    const itemID = res.locals.itemID;
    if (itemID === null || itemID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
    } else {
      databaseUtils.request('SELECT * FROM WeeklyQueenScores WHERE LeagueID=@LeagueID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: itemID }
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
        })
    }
  })

  app.get('/api/league/*', apiUtils.getItemID(), (req, res) => {
    const itemID = res.locals.itemID;
    if (itemID === null || itemID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
    } else {
      databaseUtils.request('SELECT ID, Name, Description FROM Leagues WHERE ID=@ID AND Enabled=1', 0, [
        { name: "ID", type: tedious.TYPES.Int, value: itemID }
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
    if (!data && data !== {})
      return res.status(400).json(apiUtils.generateError(400));

    const errors = validator.validate(data, validator.types.newLeague);
    if (errors)
      return res.status(400).json(apiUtils.generateError(400, errors));

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
                      doneTransaction("Error loading bulk rows for new league", () => {
                        res.status(500).json(apiUtils.generateError(500, "Error loading bulk rows for new league"));
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

                  data.users.forEach(v => {
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
  registerApi
}