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
 * @returns new Promise resolving to the Tedious Connection object
 */
function connect() {
  return new Promise((resolve, reject) => {
    const newConnection = new Connection(dbConfig);

    newConnection.on('connect', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(newConnection);
      }
    })

    newConnection.connect();
  })
}

/**
 * Creates a promise that resolves with the results of the
 * 
 * @param {string} query Query to run against sql server
 * @param {int} numRows Number of rows to return, set to 0 for all rows
 * @param {Object[]} parameters Array of parameters to set on the query
 * @param {string} parameters[].name Name of parameter in the query
 * @param {string} parameters[].value Value of the parameter
 * @param {tedious.TediousType}  parameters[].type Type of the parameter
 * @returns The result of the request 
 */
function request(query, numRows, parameters) {
  return new Promise((resolve, reject) => {
    connect()
      .then(connection => {
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
          rows.push(columns);

          if(numRows && numRows > 0 && rows.length === numRows){
            resolve(rows);
          }
        })

        newRequest.on('done', () => {
          resolve(rows);
        })

        newRequest.on('error', (err) => {
          reject(err);
        })

        connection.execSql(newRequest);
      })
  })
}

module.exports = {
  connect,
  request
}