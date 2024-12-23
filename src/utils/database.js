const tedious = require('tedious');
const Connection = tedious.Connection;
const Request = tedious.Request;

const dbConfig = {
  server: process.env.DB_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    database: process.env.DB_DATABASE,
    validateBulkLoadParameters: true,
    trustServerCertificate: true,
    useColumnNames: true,
  }
}
/**
 * @typedef {Object.<string, tedious.ColumnValue>} TediousRow
 */

/**
 * Returns new connection to the database server
 * 
 * @returns {Promise<tedious.Connection>} new Promise resolving to the Tedious Connection object
 */
function connect() {
  return new Promise((resolve, reject) => {
    const newConnection = new Connection(dbConfig);

    newConnection.connect((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(newConnection);
      }
    });
  })
}

/**
 * Creates a promise that resolves with the results of the query. This method will create a new connection to the database, use requestWithConnection if a connection should be reused (eg: in transactions).
 * 
 * @param {string} query Query to run against sql server
 * @param {int} numRows Number of rows to return, set to 0 for all rows
 * @param {Object[]} parameters Array of parameters to set on the query
 * @param {string} parameters[].name Name of parameter in the query
 * @param {string} parameters[].value Value of the parameter
 * @param {tedious.TediousType}  parameters[].type Type of the parameter
 * @param {boolean?} isProcedure True if the request is a stored procedure
 * @returns {Promise<TediousRow[]>} The result of the request
 */
function request(query, numRows, parameters, isProcedure = false) {
  return new Promise((resolve, reject) => {
    connect()
      .then(connection => {
        requestWithConnection(connection, query, numRows, parameters, isProcedure)
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            reject(error);
          })
          .finally(() => {
            connection.close();
          })
      })
      .catch(err => {
        reject(err);
      })
  })
}

/**
 * Creates a promise that resolves with the results of the query on a specified connection.
 * 
 * @param {tedious.Connection} connection Connection to use for the request
 * @param {string} query Query to run against sql server
 * @param {int} numRows Number of rows to return, set to 0 for all rows
 * @param {Object[]} parameters Array of parameters to set on the query
 * @param {string} parameters[].name Name of parameter in the query
 * @param {string} parameters[].value Value of the parameter
 * @param {tedious.TediousType} parameters[].type Type of the parameter
 * @param {tedious.ParameterOptions?} parameters[].options Options of the parameter
 * @param {boolean?} isProcedure True if the request is a stored procedure
 * @returns {Promise<TediousRow[]>} The result of the request
 */
function requestWithConnection(connection, query, numRows, parameters, isProcedure = false, returnMetadata = false) {
  return new Promise((resolve, reject) => {
    const resultingData = {
      rows: [],
      totalModified: 0,
    }

    const newRequest = new Request(query, (err, rowCount) => {
      if (err) {
        reject(err);
      } else {
        resultingData.totalModified = rowCount;

        if (returnMetadata) {
          resolve(resultingData);
        } else {
          resolve(resultingData.rows);
        }
      }
    });

    if (parameters && Array.isArray(parameters)) {
      parameters.forEach(obj => {
        newRequest.addParameter(obj.name, obj.type, obj.value, obj.options ?? {});
      })
    }

    newRequest.on('row', (columns) => {
      if (!numRows || numRows === 0 || resultingData.rows.length < numRows) {
        resultingData.rows.push(columns);
      }
    })

    if (isProcedure) {
      connection.callProcedure(newRequest);
    } else {
      connection.execSql(newRequest);
    }
  });
}

/**
 * Creates a promise that resolves with the results of the query on a specified connection.
 * 
 * @param {tedious.Connection?} connection Connection to use for the request
 * @param {string} query Query to run against sql server
 * @param {int} numRows Number of rows to return, set to 0 for all rows
 * @param {Object[]} parameters Array of parameters to set on the query
 * @param {string} parameters[].name Name of parameter in the query
 * @param {string} parameters[].value Value of the parameter
 * @param {tedious.TediousType}  parameters[].type Type of the parameter
 * @param {boolean?} isProcedure True if the request is a stored procedure
 * @returns {Promise<TediousRow[]>} The result of the request
 */

function requestWithConnectionOrDefault(connection = null, query, numRows, parameters, isProcedure) {
  if (connection) {
    return requestWithConnection(connection, query, numRows, parameters, isProcedure);
  }

  return request(query, numRows, parameters, isProcedure);
}

/**
 * Creates a promise that interacts directly with a connection's transaction
 * 
 * @param {tedious.Connection?} connection Connection to use for the request
 * @param {() => Promise} callback Callback to use with new transaction
 * @returns {Promise<TediousRow[]>} The result of the request
 */
function useTransactionWithPromise(connection, callback) {
  return new Promise((resolve, reject) => {
    connection.transaction((newTransactionError, done) => {
      if(newTransactionError){
        console.error("Error making new transaction", newTransactionError);
        return reject(newTransactionError);
      }

      return callback()
        .then(() => {
          done(null, (finishError) => {
            if(finishError){
              return reject(finishError);
            }
            return resolve();
          })
        })
        .catch(err => {
          done(err, (finishError) => {
            if(finishError){
              reject(finishError);
            }
            reject(err);
          })
        });
    })
  })
}

module.exports = {
  connect,
  request,
  requestWithConnection,
  requestWithConnectionOrDefault,
  useTransactionWithPromise
}