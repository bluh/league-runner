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
                { name: "AllowLeaders", type: tedious.TYPES.Bit, value: leagueData.draftLeader },
                { name: "Hash", type: tedious.TYPES.NVarChar, value: newHash },
              ], true)
                .then((createLeagueData) => {
                  const createLeagueError = createLeagueData[0].Error.value;
                  if (createLeagueError) {
                    connection.close();
                    return reject(apiUtils.generateError(500, createLeagueData[0].Message.value));
                  } else {
                    const newLeagueId = createLeagueData[0].Message.value * 1;
                    bulkLoadUsers(connection, userID, leagueData, newLeagueId)
                      .then(() => bulkLoadQueens(connection, leagueData, newLeagueId))
                      .then(() => bulkLoadRules(connection, leagueData, newLeagueId))
                      .then(() => {
                        doneTransaction(null, (transactionError) => {
                          if (transactionError) {
                            console.error(transactionError);
                            reject(apiUtils.generateError(500, "Error finalizing transaction", transactionError));
                          }else{
                            resolve(newLeagueId);
                          }
                        })
                      })
                      .catch(bulkLoadError => {
                        doneTransaction(new Error(`Error bulk loading data: ${bulkLoadError}`), () => {
                          connection.close();
                          console.error(bulkLoadError);
                          reject(apiUtils.generateError(500, "Error bulk loading new data", bulkLoadError));
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

function bulkLoadUsers(connection, userID, leagueData, newLeagueId){
  return new Promise((resolve, reject) => {
    // Bulk load new users into league
    const bulkLoadUsers = connection.newBulkLoad('UserLeagues', (usersLoadError, usersLoadRows) => {
      // Finished user bulk load
      if (usersLoadError || usersLoadRows === 0) {
        console.error('Error bulk loading users', usersLoadError);
        reject("Error bulk loading users");
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

function bulkLoadQueens(connection, leagueData, newLeagueId){
  return new Promise((resolve, reject) => {
    // Bulk load new queens into league
    const bulkLoadQueens = connection.newBulkLoad('Queens', (queensLoadError, queensLoadRows) => {
      // Finished queen bulk load
      if (queensLoadError || queensLoadRows === 0) {
        console.error('Error bulk loading queens', queensLoadError);
        reject("Error bulk loading queens");
      } else {
        resolve();
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

function bulkLoadRules(connection, leagueData, newLeagueId){
  return new Promise((resolve, reject) => {
    // Bulk load new rules into league
    const bulkLoadRules = connection.newBulkLoad('Rules', (rulesLoadError, rulesLoadRows) => {
      // Finished rule bulk load
      if (rulesLoadError || rulesLoadRows === 0) {
        console.error('Error bulk loading rules', rulesLoadError);
        reject('Error bulk loading rules');
      } else {
        resolve();
      }
    })

    // Set data for rule load

    bulkLoadRules.addColumn('LeagueID', tedious.TYPES.Int, { nullable: false });
    bulkLoadRules.addColumn('DisplayName', tedious.TYPES.NVarChar, { nullable: false });
    bulkLoadRules.addColumn('Description', tedious.TYPES.NVarChar, { nullable: true });
    bulkLoadRules.addColumn('PointValue', tedious.TYPES.Int, { nullable: false });
    bulkLoadRules.addColumn('Enabled', tedious.TYPES.Bit, { nullable: false });

    leagueData.rules.forEach(r => {
      bulkLoadRules.addRow(newLeagueId, r.name, r.description, r.points, true);
    })

    connection.execBulkLoad(bulkLoadRules);
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

function updateLeague(userID, leagueID, leagueData) {
  return new Promise((resolve, reject) => {
    databaseUtils.connect()
      .then(connection => {
        connection.transaction((newTransactionError, doneTransaction) => {
          if (newTransactionError) {
            connection.close();
            return reject(apiUtils.generateError(500, "Error creating transaction", newTransactionError))
          }

          databaseUtils.requestWithConnection(connection,
            "SELECT * FROM UserAndLeagues WHERE UserID=@UserID AND LeagueID=@LeagueID AND LeagueRoleID>1", 1, [
              { name: "UserID", value: userID, type: tedious.TYPES.Int },
              { name: "LeagueID", value: leagueID, type: tedious.TYPES.Int }
            ])
            .then(data => {
              if(data.length === 0){
                return reject(apiUtils.generateError(401, "Unauthorized"));
              }

              const { name, description, drafts, draftLeader } = leagueData;

              databaseUtils.requestWithConnection(connection,
                "UPDATE Leagues SET Name=@Name, Description=@Description, Drafts=@Drafts, DraftLeader=@Leader WHERE ID=@LeagueID", 0, [
                  { name: "Name", value: name, type: tedious.TYPES.Text },
                  { name: "Description", value: description, type: tedious.TYPES.Text },
                  { name: "Drafts", value: drafts, type: tedious.TYPES.Numeric },
                  { name: "Leader", value: draftLeader, type: tedious.TYPES.Bit },
                  { name: "LeagueID", value: leagueID, type: tedious.TYPES.Numeric }
                ]
              )
              .then(() => {
                doneTransaction(null, (transactionError) => {
                  if (transactionError) {
                    console.error(transactionError);
                    reject(apiUtils.generateError(500, "Error finalizing transaction", transactionError));
                  }else{
                    resolve();
                  }
                })
              })
              .catch(updateError => {
                doneTransaction(new Error(`Error updating data: ${updateError}`), () => {
                  connection.close();
                  console.error(updateError);
                  reject(apiUtils.generateError(500, "Error updating League data", updateError));
                })
              })
            })
            .catch(leagueError => {
              doneTransaction("Error updating league", () => {
                connection.close();
                console.error(leagueError);
                reject(apiUtils.generateError(500, "Error updating league", leagueError));
              })
            })
        }, tedious.ISOLATION_LEVEL.REPEATABLE_READ)
      })
  })
}

module.exports = {
  createLeague,
  updateLeague
}