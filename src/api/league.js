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

function getUserLeagues(req, res) {
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
            console.error(err);
            reject(apiUtils.generateError(500, "Error getting data", err));
          })
      })
      .catch(err => {
        console.error(err);
        reject(apiUtils.generateError(500, "User is not logged in", err));
      })
  });
}

function getQueensInLeague(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT * FROM TotalQueenScores WHERE LeagueID=@LeagueID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            id: values.ID.value,
            name: values.Name.value,
            points: values.Points.value
          }));

          res.status(200).json(responseData);
          resolve();
        })
        .catch(err => {
          console.error(err);
          reject(apiUtils.generateError(500, "Error getting data", err));
        })
    }
  })
}

function getLeague(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT TOP(1) ID, Name, Description FROM Leagues WHERE ID=@ID AND Enabled=1', 1, [
        { name: "ID", type: tedious.TYPES.Int, value: leagueID }
      ])
        .then((data) => {
          if(data.length === 0){
            reject(apiUtils.generateError(404, "No League found"));
          }else{
            const responseData = data.map(values => ({
              id: values.ID.value,
              name: values.Name.value,
              description: values.Description.value
            }))
            res.status(200).json(responseData[0]);
            resolve();
          }
        })
        .catch((err) => {
          console.error(err);
          reject(apiUtils.generateError(500, "Error getting data", err));
        })
    }
  })
}

function newLeague(req, res) {
  return new Promise((resolve, reject) => {
    const data = req.body;
    const userID = res.locals.userID;

    if (!data || data === {}) {
      return reject(apiUtils.generateError(400, "No payload"));
    }

    const errors = validator.validate(data, validator.types.newLeague);
    if (errors) {
      return reject(apiUtils.generateError(400, "Invalid payload", { errors }));
    }

    databaseUtils.connect()
      .then(connection => {
        connection.transaction((newTransactionError, doneTransaction) => {
          if (newTransactionError){
            return reject(apiUtils.generateError(500, "Error creating transaction", newTransactionError))
          }

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
                        console.error(err);
                        reject(apiUtils.generateError(500, "Error loading bulk rows for new league", err));
                      });
                    } else {
                      doneTransaction(null, (transactionError) => {
                        if (transactionError){
                          console.error(transactionError);
                          return reject(apiUtils.generateError(500, transactionError)); 
                        }
                        res.status(200).json(newId);
                        resolve();
                      })
                    }
                  })

                  bulkLoad.addColumn('LeagueID', tedious.TYPES.Int, { nullable: false });
                  bulkLoad.addColumn('UserID', tedious.TYPES.Int, { nullable: false });
                  bulkLoad.addColumn('RoleID', tedious.TYPES.Int, { nullable: false });

                  bulkLoad.addRow(newId, userID, 3);

                  data.users.forEach(v => {
                    if (v.user !== userID)
                      bulkLoad.addRow(newId, v.user, v.role);
                  })

                  connection.execBulkLoad(bulkLoad);
                })
                .catch(leagueError => {
                  doneTransaction("Error creating new league", () => {
                    console.error(leagueError);
                    reject(apiUtils.generateError(500, "Error creating new league", leagueError));
                  })
                })
            })
        }, tedious.ISOLATION_LEVEL.REPEATABLE_READ)
      })
  })
}

function registerApi(app) {
  /**
   * @openapi
   * 
   * tags:
   *  name: League
   *  description: API calls for League management
   * 
   * /api/leagues:
   *  get:
   *    description: Gets the Leagues for the current User
   *    tags: [League]
   *    responses:
   *      200:
   *        description: The Leagues for the current User
   */
  app.get('/api/leagues', apiUtils.wrapHandler(getUserLeagues));


  /**
   * @openapi
   * 
   * /api/league/{leagueID}/queens:
   *  get:
   *    description: Get the Queens in a League
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Queens in the league
   */
  app.get('/api/league/:leagueID/queens', apiUtils.wrapHandler(getQueensInLeague));


  /**
   * @openapi
   * 
   * /api/league/{leagueID}:
   *  get:
   *    description: Get the League object
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The League object
   */
  app.get('/api/league/:leagueID',  apiUtils.wrapHandler(getLeague));


  /**
   * @openapi
   * 
   * /api/league:
   *  post:
   *    description: Create a new League
   *    tags: [League]
   *    requestBody:
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/definitions/newLeague'
   *    responses:
   *      200:
   *        description: The Queens in the league
   */
  app.post('/api/league', roleUtils.authorize(['User']), apiUtils.wrapHandler(newLeague));
}

module.exports = {
  name: "League API",
  registerApi,
  methods: {
    getUserLeagues,
    getQueensInLeague,
    getLeague
  }
}