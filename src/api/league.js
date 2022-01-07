const tedious = require('tedious');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');
const databaseUtils = require('../utils/database');
const { validator, types} = require('../utils/validator');
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

    const errors = validator.validate(data, types.newLeague);
    if (errors) {
      return reject(apiUtils.generateError(400, "Invalid payload", { errors }));
    }

    databaseUtils.connect()
      .then(connection => {
        connection.transaction((newTransactionError, doneTransaction) => {
          if (newTransactionError){
            connection.close();
            return reject(apiUtils.generateError(500, "Error creating transaction", newTransactionError))
          }

          generateHash(connection)
            .then(newHash => {
              databaseUtils.requestWithConnection(connection, "CreateLeague", 0, [
                { name: "Creator", type: tedious.TYPES.Int, value: userID },
                { name: "Name", type: tedious.TYPES.NVarChar, value: data.name },
                { name: "Description", type: tedious.TYPES.NVarChar, value: data.description || null },
                { name: "Drafts", type: tedious.TYPES.Int, value: data.drafts },
                { name: "AllowLeaders", type: tedious.TYPES.Bit, value: data.allowLeaders },
                { name: "Hash", type: tedious.TYPES.NVarChar, value: newHash },
              ], true)
                .then((createLeagueData) => {
                  const createLeagueError = createLeagueData[0].Error.value;
                  if(createLeagueError){
                    connection.close();
                    return reject(apiUtils.generateError(500, createLeagueData[0].Message.value));
                  }else{
                    const newId = createLeagueData[0].Message.value * 1;
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
                            connection.close();
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
                  }
                })
                .catch(leagueError => {
                  doneTransaction("Error creating new league", () => {
                    connection.close();
                    console.error(leagueError);
                    reject(apiUtils.generateError(500, "Error creating new league", leagueError));
                  })
                })
            })
        }, tedious.ISOLATION_LEVEL.REPEATABLE_READ)
      })
  })
}

function getQueensInLeague(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT ID, Name, TotalPoints, LeaderPoints, Rank FROM TotalQueenScores WHERE LeagueID=@LeagueID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            id: values.ID.value,
            name: values.Name.value,
            totalPoints: values.TotalPoints.value,
            leaderPoints: values.LeaderPoints.value,
            rank: values.Rank.value
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

function getQueenDetails(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    const queenID = req.params.queenID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else if (queenID === null || queenID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid queen ID"));
      reject();
    } else {
      databaseUtils.request('SELECT EpisodeID, EpisodeNumber, EpisodeName, WeeklyPoints, WeeklyLeaderPoints, WeeklyRank, OverallPoints, OverallLeaderPoints, OverallRank FROM WeeklyQueenScores WHERE LeagueID=@LeagueID AND QueenID=@QueenID ORDER BY EpisodeID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID },
        { name: "QueenID", type: tedious.TYPES.Int, value: queenID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            episode: {
              id: values.EpisodeID.value,
              number: values.EpisodeNumber.value,
              name: values.EpisodeName.value
            },
            weeklyPoints: values.WeeklyPoints.value,
            weeklyLeaderPoints: values.WeeklyLeaderPoints.value,
            weeklyRank: values.WeeklyRank.value,
            overallPoints: values.OverallPoints.value,
            overallLeaderPoints: values.OverallLeaderPoints.value,
            overallRank: values.OverallRank.value
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

function getUsersInLeague(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT UserID, Username, UserPoints, Rank, LeagueRoleID, LeagueRoleName FROM TotalUserScores WHERE LeagueID=@LeagueID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            id: values.UserID.value,
            name: values.Username.value,
            points: values.UserPoints.value,
            rank: values.Rank.value * 1,
            role: {
              id: values.LeagueRoleID.value,
              name: values.LeagueRoleName.value
            }
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
  app.get('/api/league/:leagueID/queens', roleUtils.authorize(['User']), apiUtils.wrapHandler(getQueensInLeague));


  /**
   * @openapi
   * 
   * /api/league/{leagueID}/users:
   *  get:
   *    description: Get the Users in a League
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Users in the league
   */
  app.get('/api/league/:leagueID/users', roleUtils.authorize(['User']), apiUtils.wrapHandler(getUsersInLeague));


  /**
   * @openapi
   * 
   * /api/league/{leagueID}/weekly/{queenID}:
   *  get:
   *    description: Get the weekly scores of a Queen in a League
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *      - name: queenID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The weekly scores of the Queen
   */
  app.get('/api/league/:leagueID/weekly/:queenID', roleUtils.authorize(['User']), apiUtils.wrapHandler(getQueenDetails));
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