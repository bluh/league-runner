const tedious = require('tedious');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');
const leagueUtils = require('../utils/league');
const databaseUtils = require('../utils/database');
const { validator, types } = require('../utils/validator');

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

    if (!data) {
      return reject(apiUtils.generateError(400, "No payload"));
    }

    const errors = validator.validate(data, types.newLeague);
    if (errors) {
      return reject(apiUtils.generateError(400, "Invalid payload", { errors }));
    }

    leagueUtils.createLeague(userID, data)
      .then(newID => {
        res.status(200).json(newID);
      })
      .catch(error => {
        res.status(500).json(error);
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

function getUserWeeklyDetails(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    const userID = req.params.userID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else if (userID === null || userID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid user ID"));
      reject();
    } else {
      databaseUtils.request('SELECT UserID, EpisodeID, EpisodeName, EpisodeNumber, WeeklyPoints, WeeklyRank FROM WeeklyRunningUserScores WHERE LeagueID=@LeagueID AND UserID=@UserID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID },
        { name: "UserID", type: tedious.TYPES.Int, value: userID },
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            episode: {
              id: values.EpisodeID.value,
              name: values.EpisodeName.value,
              number: values.EpisodeNumber.value
            },
            userId: values.UserID.value,
            weeklyPoints: values.WeeklyPoints.value,
            weeklyRank: values.WeeklyRank.value * 1,
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

function getUserDraftDetails(req, res){
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    const userID = req.params.userID;
    const episodeID = req.params.episodeID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else if (userID === null || userID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid user ID"));
      reject();
    } else if (episodeID === null || episodeID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid episode ID"));
      reject();
    } else {
      databaseUtils.request('SELECT EpisodeID, QueenID, QueenName, Leader, WeeklyQueenPoints, WeeklyQueenRank FROM UserDraftDetails WHERE LeagueID=@LeagueID AND UserID=@UserID AND EpisodeID=@EpisodeID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID },
        { name: "UserID", type: tedious.TYPES.Int, value: userID },
        { name: "EpisodeID", type: tedious.TYPES.Int, value: episodeID },
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            episodeId: values.EpisodeID.value,
            queen: {
              id: values.QueenID.value,
              name: values.QueenName.value,
              leader: values.Leader.value,
            },
            points: values.WeeklyQueenPoints.value,
            rank: values.WeeklyQueenRank.value * 1,
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

function getRulesInLeague(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT ID, DisplayName, Description, PointValue FROM Rules WHERE LeagueID=@LeagueID', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            id: values.ID.value,
            name: values.DisplayName.value,
            description: values.Description.value,
            points: values.PointValue.value,
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

function getEpisodesInLeague(req, res) {
  return new Promise((resolve, reject) => {
    const leagueID = req.params.leagueID;
    if (leagueID === null || leagueID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT ID, Name, Number, AirDate FROM LeagueEpisodes WHERE LeagueID=@LeagueID ORDER BY Number', 0, [
        { name: "LeagueID", type: tedious.TYPES.Int, value: leagueID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            id: values.ID.value,
            name: values.Name.value,
            number: values.Number.value,
            airDate: values.AirDate.value
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
   * /api/league/{leagueID}/queens/{queenID}/weekly:
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
  app.get('/api/league/:leagueID/queens/:queenID/weekly', roleUtils.authorize(['User']), apiUtils.wrapHandler(getQueenDetails));


  /**
   * @openapi
   * 
   * /api/league/{leagueID}/rules:
   *  get:
   *    description: Get the Rules in a League
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Rules in the league
   */
  app.get('/api/league/:leagueID/rules', roleUtils.authorize(['User']), apiUtils.wrapHandler(getRulesInLeague));


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
   * /api/league/{leagueID}/users/{userID}/weekly:
   *  get:
   *    description: Get the weekly scores of a User in a League
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *      - name: userID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The weekly scores of the User
   */
  app.get('/api/league/:leagueID/users/:userID/weekly', roleUtils.authorize(['User']), apiUtils.wrapHandler(getUserWeeklyDetails));


  /**
   * @openapi
   * 
   * /api/league/{leagueID}/users/{userID}/drafts/{episodeID}:
   *  get:
   *    description: Get the episode's drafts of a User in a League
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *      - name: userID
   *        in: path
   *        required: true
   *        type: integer
   *      - name: episodeID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The weekly scores of the User
   */
  app.get('/api/league/:leagueID/users/:userID/drafts/:episodeID', roleUtils.authorize(['User']), apiUtils.wrapHandler(getUserDraftDetails));


  /**
   * @openapi
   * 
   * /api/league/{leagueID}/episodes:
   *  get:
   *    description: Get the Episodes in a League
   *    tags: [League]
   *    parameters:
   *      - name: leagueID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Episodes in the league
   */
  app.get('/api/league/:leagueID/episodes', roleUtils.authorize(['User']), apiUtils.wrapHandler(getEpisodesInLeague));
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