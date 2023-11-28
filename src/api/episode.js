const tedious = require('tedious');
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
      id: values.ID.value,
      name: values.Name.value,
      leagueID: values.LeagueID.value,
      number: values.Number.value,
      airDate: values.AirDate.value,
    }),
    true
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
    values => ({
      id: values.RecordID.value,
      episodeID: values.EpisodeID.value,
      leagueID: values.LeagueID.value,
      timestamp: values.Timestamp.value,
      queen: {
        id: values.QueenID.value,
        name: values.QueenName.value
      },
      rule: {
        id: values.RuleID.value,
        name: values.RuleName.value,
        points: values.RulePoints.value,
      }
    })
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
    values => ({
      leagueID: values.LeagueID.value,
      queen: {
        id: values.QueenID.value,
        name: values.QueenName.value
      },
      lastSeenEpisode: values.LastSeenEpisode.value,
      lastSeenStatus: values.LastSeenStatus.value,
      inThisEpisode: values.InThisEpisode.value,
      inNextEpisode: values.InNextEpisode.value,
    })
  );
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