const moment = require("moment");
const tedious = require("tedious");
const databaseUtils = require("./database");
const leagueUtils = require("./league");
const apiUtils = require("./api");
const { validateEpisodeForm } = require("../types/validators");

function bulkLoadDetails(connection, details, newEpisodeID) {
  return new Promise((resolve, reject) => {
    // Bulk load new details into league
    const bulkLoadDetails = connection.newBulkLoad('QueenRules', (detailsLoadError, detailsLoadRows) => {
      // Finished details bulk load
      if (detailsLoadError || detailsLoadRows === 0) {
        reject("Error bulk loading details");
      } else {
        resolve();
      }
    })

    // Set data for queen load

    bulkLoadDetails.addColumn('QueenID', tedious.TYPES.Int, { nullable: false });
    bulkLoadDetails.addColumn('RuleID', tedious.TYPES.Int, { nullable: false });
    bulkLoadDetails.addColumn('EpisodeID', tedious.TYPES.Int, { nullable: false });
    bulkLoadDetails.addColumn('Timestamp', tedious.TYPES.Time, { nullable: true });

    const rows = [];

    details.forEach(detail => {
      rows.push({
        QueenID: detail.queen.id,
        RuleID: detail.rule.id,
        EpisodeID: newEpisodeID,
        Timestamp: moment.utc(detail.timestamp, "HH:mm:ss").toDate()
      });
    });

    connection.execBulkLoad(bulkLoadDetails, rows);
  });
}

async function updateEpisodeDetails(connection, details, episodeID){
  const table = {
    columns: [
      { name: 'ID', type: tedious.TYPES.Int },
      { name: 'QueenID', type: tedious.TYPES.Int },
      { name: 'RuleID', type: tedious.TYPES.Int },
      { name: 'Timestamp', type: tedious.TYPES.Time, scale: 2 },
    ],
    rows: details.map(detail => [
      detail.id,
      detail.queen.id,
      detail.rule.id,
      moment.utc(detail.timestamp, "HH:mm:ss").toDate()
    ])
  };

  await databaseUtils.requestWithConnection(connection, "MergeQueenRules", 0, [
    { name: "MergeTable", value: table, type: tedious.TYPES.TVP },
    { name: "ForEPID", value: episodeID, type: tedious.TYPES.Int }
  ], true);
}

async function createOrUpdateEpisode(userID, episodeData, creating, episodeID) {
  const errors = validateEpisodeForm(episodeData);

  if(errors){
    throw apiUtils.generateError(400, "Bad request", errors);
  }
  const { leagueID, name, number, airDate, details } = episodeData;

  const connection = await databaseUtils.connect();

  try {
    await leagueUtils.canUpdateLeague(userID, leagueID, connection);
  } catch (err) {
    throw apiUtils.generateError(401, "Unauthorized");
  }

  if(creating){
    await databaseUtils.useTransactionWithPromise(connection, async () => {
      const data = await databaseUtils.requestWithConnection(connection,
        "INSERT INTO dbo.Episodes(Name, LeagueID, Number, Enabled, AirDate) OUTPUT Inserted.ID VALUES(@Name, @LeagueID, @Number, 1, @AirDate)",
        1,
        [
          { name: "Name", value: name, type: tedious.TYPES.Text },
          { name: "LeagueID", value: leagueID, type: tedious.TYPES.Int },
          { name: "Number", value: number, type: tedious.TYPES.Int },
          { name: "AirDate", value: airDate, type: tedious.TYPES.Date }
        ], false, true);
  
      if (data.totalModified !== 1) {
        throw apiUtils.generateError(500, "Episode insert failed");
      }
  
      if(details && details.length > 0){
        const newDataID = data.rows[0].ID.value;
  
        return await bulkLoadDetails(connection, details, newDataID);
      }
    });
  }else{
    if(!episodeID){
      throw apiUtils.generateError(400, "Invalid EP ID");
    }

    await databaseUtils.useTransactionWithPromise(connection, async () => {
      const data = await databaseUtils.requestWithConnection(connection,
        "UPDATE dbo.Episodes SET Name = @Name, AirDate = @AirDate OUTPUT INSERTED.ID WHERE ID = @ID",
        1,
        [
          { name: "Name", value: name, type: tedious.TYPES.Text },
          { name: "AirDate", value: airDate, type: tedious.TYPES.Date },
          { name: "ID", value: episodeID, type: tedious.TYPES.Int }
        ], false, true);
  
      if (data.totalModified !== 1) {
        throw apiUtils.generateError(500, "Episode insert failed");
      }
      const newDataID = data.rows[0].ID.value;

      return await updateEpisodeDetails(connection, details ?? [], newDataID);
    })
  }

  connection.close();
}

module.exports = {
  createOrUpdateEpisode
}