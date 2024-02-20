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
 * @returns The result of the request 
 */
function request(query, numRows, parameters, isProcedure=false) {
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
 * @param {tedious.TediousType}  parameters[].type Type of the parameter
 * @param {boolean?} isProcedure True if the request is a stored procedure
 * @returns The result of the request 
 */
function requestWithConnection(connection, query, numRows, parameters, isProcedure=false) {
  return new Promise((resolve,reject) => {
    const rows = [];

    const newRequest = new Request(query, (err) => {
      if (err) {
        reject(err);
      }else{
        resolve(rows);
      }
    });

    if (parameters && Array.isArray(parameters)) {
      parameters.forEach(obj => {
        newRequest.addParameter(obj.name, obj.type, obj.value);
      })
    }

    newRequest.on('row', (columns) => {
      if(!numRows || numRows === 0 || rows.length < numRows){
        rows.push(columns);
      }
    })

    newRequest.on('error', (err) => {
      reject(err);
    })

    if(isProcedure){
      connection.callProcedure(newRequest);
    }else{
      connection.execSql(newRequest);
    }
  });
}

module.exports = {
  connect,
  request,
  requestWithConnection
}