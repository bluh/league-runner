const tedious = require('tedious');
const databaseUtils = require('../utils/database');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');

function getEpisode(req,res){
  return new Promise((resolve, reject) => {
    const episodeID = req.params.episodeID;
    if (episodeID === null || episodeID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT ID, Name, LeagueID, Number, AirDate FROM Episodes WHERE ID=@EpisodeID AND Enabled=1', 0, [
        { name: "EpisodeID", type: tedious.TYPES.Int, value: episodeID }
      ])
        .then((data) => {
          if(data.length === 0){
            reject(apiUtils.generateError(404, "No League found"));
          }else{
            const responseData = data.map(values => ({
              id: values.ID.value,
              name: values.Name.value,
              leagueID: values.LeagueID.value,
              number: values.Number.value,
              airDate: values.AirDate.value,
            }));
  
            res.status(200).json(responseData[0]);
            resolve();
          }
        })
        .catch(err => {
          console.error(err);
          reject(apiUtils.generateError(500, "Error getting data", err));
        })
    }
  })
}

function getEpisodeDetails(req, res) {
  return new Promise((resolve, reject) => {
    const episodeID = req.params.episodeID;
    if (episodeID === null || episodeID === undefined) {
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
      reject();
    } else {
      databaseUtils.request('SELECT EpisodeID, LeagueID, EpisodeNumber, RecordID, QueenID, QueenName, RuleID, RuleName, RulePoints, Timestamp FROM EpisodeDetails WHERE EpisodeID=@EpisodeID', 0, [
        { name: "EpisodeID", type: tedious.TYPES.Int, value: episodeID }
      ])
        .then((data) => {
          const responseData = data.map(values => ({
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
}


module.exports = {
  name: "Episode API",
  registerApi,
  methods: {
    getEpisodeDetails
  }
}