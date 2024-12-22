const moment = require("moment");
const tedious = require("tedious");
const databaseUtils = require("./database");
const leagueUtils = require("./league");
const apiUtils = require("./api");

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

async function createEpisode(userID, episodeData) {
  const { leagueID, name, number, airDate, details } = episodeData;

  const connection = await databaseUtils.connect();

  try {
    await leagueUtils.canUpdateLeague(userID, leagueID, connection);
  } catch (err) {
    throw apiUtils.generateError(400, "Unauthorized");
  }

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

  connection.close();
}

module.exports = {
  createEpisode
}