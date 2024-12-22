const tedious = require('tedious');
const episodeUtils = require("../utils/episode");
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');

function getEpisode(req,res){
  return apiUtils.queryDatabase(
    req,
    res,
    ["episodeID"],
    {
      queryString: "SELECT ID, Name, LeagueID, Number, AirDate FROM Episodes WHERE ID=@EpisodeID AND Enabled=1",
      queryParams: [
        { name: "EpisodeID", type: tedious.TYPES.Int, param: "episodeID" }
      ]
    },
    values => ({
      id: values[0].ID.value,
      name: values[0].Name.value,
      leagueID: values[0].LeagueID.value,
      number: values[0].Number.value,
      airDate: values[0].AirDate.value,
    })
  );
}

function getEpisodeDetails(req, res) {
  return apiUtils.queryDatabase(
    req,
    res,
    ["episodeID"],
    {
      queryString: "SELECT EpisodeID, LeagueID, EpisodeNumber, RecordID, QueenID, QueenName, RuleID, RuleName, RulePoints, Timestamp FROM EpisodeDetails WHERE EpisodeID=@EpisodeID",
      queryParams: [
        { name: "EpisodeID", type: tedious.TYPES.Int, param: "episodeID" }
      ]
    },
    values => values.map(value => ({
      id: value.RecordID.value,
      episodeID: value.EpisodeID.value,
      leagueID: value.LeagueID.value,
      timestamp: value.Timestamp.value,
      queen: {
        id: value.QueenID.value,
        name: value.QueenName.value
      },
      rule: {
        id: value.RuleID.value,
        name: value.RuleName.value,
        points: value.RulePoints.value,
      }
    }))
  );
}

function getEpisodeQueens(req, res){
  return apiUtils.queryDatabase(
    req,
    res,
    ["episodeID"],
    {
      queryString: "SELECT LeagueID, QueenID, QueenName, LastSeenEpisode, LastSeenStatus, InThisEpisode, InNextEpisode FROM QueenStatusTracker WHERE EpisodeID=@EpisodeID ORDER BY QueenID",
      queryParams: [
        { name: "EpisodeID", type: tedious.TYPES.Int, param: "episodeID" }
      ]
    },
    values => values.map(value => ({
      leagueID: value.LeagueID.value,
      queen: {
        id: value.QueenID.value,
        name: value.QueenName.value
      },
      lastSeenEpisode: value.LastSeenEpisode.value,
      lastSeenStatus: value.LastSeenStatus.value,
      inThisEpisode: value.InThisEpisode.value,
      inNextEpisode: value.InNextEpisode.value,
    }))
  );
}

function createNewEpisode(req, res) {
  const userID = res.locals.userID;
  const data = req.body ?? {};

  return episodeUtils.createEpisode(userID, data)
    .then(() => {
      res.status(200).json({});
    })
    .catch(err => {
      if(err.DLError){
        throw err;
      }else{
        throw apiUtils.generateError(500, "Error creating new Episode", err);
      }
    })
}

function registerApi(api) {
  /**
   * @openapi
   * 
   * tags:
   *  name: Episode
   *  description: API calls for Episode management
   * 
   * /api/episode/{episodeID}/:
   *  get:
   *    description: Get the Episode object
   *    tags: [Episode]
   *    parameters:
   *      - name: episodeID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Episode object
   */
  api.get('/api/episode/:episodeID', roleUtils.authorize(['User']), apiUtils.wrapHandler(getEpisode));

  /**
   * @openapi
   * 
   * /api/episode:
   *  post:
   *    description: Create a new Episode
   *    tags: [Episode, Create]
   *    requestBody:
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/definitions/updateLeague'
   *    responses:
   *      200:
   *        description: The Episode object
   */
  api.post('/api/episode', roleUtils.authorize(['User']), apiUtils.wrapHandler(createNewEpisode));

  /**
   * @openapi
   * 
   * /api/episode/{episodeID}/details:
   *  get:
   *    description: Get the details of an Episode
   *    tags: [Episode]
   *    parameters:
   *      - name: episodeID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Episode details
   */
  api.get('/api/episode/:episodeID/details', roleUtils.authorize(['User']), apiUtils.wrapHandler(getEpisodeDetails));

  /**
   * @openapi
   * 
   * /api/episode/{episodeID}/queens:
   *  get:
   *    description: Get the Queens' Statuses in an Episode
   *    tags: [Episode]
   *    parameters:
   *      - name: episodeID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Queen Status details
   */
  api.get('/api/episode/:episodeID/queens', roleUtils.authorize(['User']), apiUtils.wrapHandler(getEpisodeQueens));
}


module.exports = {
  name: "Episode API",
  registerApi,
  methods: {
    getEpisodeDetails
  }
}