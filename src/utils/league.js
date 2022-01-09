const tedious = require('tedious');
const crypto = require('crypto');
const apiUtils = require('../utils/api');
const databaseUtils = require('../utils/database');

function createLeague(userID, leagueData) {
  return new Promise((resolve, reject) => {
    databaseUtils.connect()
      .then(connection => {
        connection.transaction((newTransactionError, doneTransaction) => {
          if (newTransactionError) {
            connection.close();
            return reject(apiUtils.generateError(500, "Error creating transaction", newTransactionError))
          }

          generateHash(connection)
            .then(newHash => {
              databaseUtils.requestWithConnection(connection, "CreateLeague", 0, [
                { name: "Creator", type: tedious.TYPES.Int, value: userID },
                { name: "Name", type: tedious.TYPES.NVarChar, value: leagueData.name },
                { name: "Description", type: tedious.TYPES.NVarChar, value: leagueData.description || null },
                { name: "Drafts", type: tedious.TYPES.Int, value: leagueData.drafts },
                { name: "AllowLeaders", type: tedious.TYPES.Bit, value: leagueData.allowLeaders },
                { name: "Hash", type: tedious.TYPES.NVarChar, value: newHash },
              ], true)
                .then((createLeagueData) => {
                  const createLeagueError = createLeagueData[0].Error.value;
                  if (createLeagueError) {
                    connection.close();
                    return reject(apiUtils.generateError(500, createLeagueData[0].Message.value));
                  } else {
                    const newLeagueId = createLeagueData[0].Message.value * 1;
                    bulkLoadUsers(connection, doneTransaction, userID, leagueData, newLeagueId)
                      .then(() => {
                        return bulkLoadQueens(connection, doneTransaction, leagueData, newLeagueId)
                      })
                      .then(() => {
                        resolve(newLeagueId);
                      })
                      .catch(usersError => {
                        doneTransaction(new Error("Error creating new users/queens"), () => {
                          connection.close();
                          console.error(usersError);
                          reject(usersError);
                        })
                      })
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

function bulkLoadUsers(connection, doneTransaction, userID, leagueData, newLeagueId){
  return new Promise((resolve, reject) => {
    // Bulk load new users into league
    const bulkLoadUsers = connection.newBulkLoad('UserLeagues', (usersLoadError, usersLoadRows) => {
      // Finished user bulk load
      if (usersLoadError || usersLoadRows === 0) {
        console.error('Error loading users for new league', usersLoadError);
        doneTransaction("Error loading users for new league", err => {
          console.error(err);
          reject(apiUtils.generateError(500, "Error loading users for new league", err.message));
        });
      } else {
        resolve();
      }
    })

    // Set data for user load

    bulkLoadUsers.addColumn('LeagueID', tedious.TYPES.Int, { nullable: false });
    bulkLoadUsers.addColumn('UserID', tedious.TYPES.Int, { nullable: false });
    bulkLoadUsers.addColumn('RoleID', tedious.TYPES.Int, { nullable: false });

    bulkLoadUsers.addRow(newLeagueId, userID, 3);

    leagueData.users.forEach(v => {
      if (v.user !== userID)
        bulkLoadUsers.addRow(newLeagueId, v.user, v.role);
    })

    connection.execBulkLoad(bulkLoadUsers);
  })
}

function bulkLoadQueens(connection, doneTransaction, leagueData, newLeagueId){
  return new Promise((resolve, reject) => {
    // Bulk load new queens into league
    const bulkLoadQueens = connection.newBulkLoad('Queens', (queensLoadError, queensLoadRows) => {
      // Finished queen bulk load
      if (queensLoadError || queensLoadRows === 0) {
        console.error('Error loading queens for new league', queensLoadError);
        doneTransaction("Error loading queens for new league", err => {
          console.error(err);
          return reject(apiUtils.generateError(500, "Error loading queens for new league", err.message));
        });
      } else {
        doneTransaction(null, (transactionError) => {
          if (transactionError) {
            console.error(transactionError);
            return reject(apiUtils.generateError(500, "Error finalizing transaction", transactionError));
          }
          resolve(newLeagueId);
        })
      }
    })

    // Set data for queen load

    bulkLoadQueens.addColumn('Name', tedious.TYPES.NVarChar, { nullable: false });
    bulkLoadQueens.addColumn('LeagueID', tedious.TYPES.Int, { nullable: false });
    bulkLoadQueens.addColumn('Eliminated', tedious.TYPES.Bit, { nullable: false });
    bulkLoadQueens.addColumn('Enabled', tedious.TYPES.Bit, { nullable: false });

    leagueData.queens.forEach(q => {
      bulkLoadQueens.addRow(q, newLeagueId, false, true);
    })

    connection.execBulkLoad(bulkLoadQueens);
  })
}

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

module.exports = {
  createLeague
}