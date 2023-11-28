const databaseUtils = require('./database');
const { STATUS_CODES } = require('http');

/**
 * Helper method to create a simple request to the database.
 * @param {Express.Request} req Request Object
 * @param {Express.Response} res Response Object
 * @param {String[]} paramsList List of parameters as a string
 * @param {Object} queryDetails Object containing details about the query
 * @param {String} queryDetails.queryString String to use to call the database
 * @param {Object[]} queryDetails.queryParams List of parameter objects to call the database
 * @param {string} queryDetails.queryParams[].name Name of parameter in query
 * @param {int} queryDetails.queryParams[].type Type of parameter in query
 * @param {string} queryDetails.queryParams[].param Name of parameter in url to use in query
 * @param {Function} dataCallback Callback to call for every row returned by the query, to transform the data
 * @param {Boolean?} returnOne Only return the first result from the query
 * @returns Promise handling the request/response from Express and rejects with errors
 */
function queryDatabase(req, res, paramsList, queryDetails, dataCallback, returnOne = false) {
  return new Promise((resolve, reject) => {
    const params = {};
    const paramSuccess = paramsList.every(param => {
      const paramValue = req.params[param];
      if(paramValue){
        params[param] = paramValue;
        return true;
      }else{
        reject(generateError(400, `Missing param: ${param}`));
        return false;
      }
    });

    if(paramSuccess){
      databaseUtils.request(queryDetails.queryString, 0,
        queryDetails.queryParams.map(detail => (
          { name: detail.name, type: detail.type, value: params[detail.param]}
        )))
        .catch(requestError => {
          console.log("Request Error:", requestError);
          reject(generateError(500, "DatabaseError", requestError.message));
        })
        .then(data => {
          const responseData = data.map(dataCallback);
          if(returnOne){
            resolve(res.status(200).json(responseData[0]));
          }else{
            resolve(res.status(200).json(responseData));
          }
        })
        .catch(mappingError => {
          console.log("Mapping Error:", mappingError);
          reject(generateError(500, "MappingError", mappingError.message));
        })
    }
  }).catch(serverError => {
    console.log("Server Error:", serverError);
    if(serverError.DLError){
      return Promise.reject(generateError(500, "ServerError", serverError));
    }else{
      return Promise.reject(generateError(500, "ServerError", serverError.message));
    }
  })
}

function generateError(code, message, inner = null){
  const error = {
    DLError: true,
    error: code,
    message: message || STATUS_CODES[code]
  };

  if(inner){
    error.inner = inner;
    if(error.inner.DLError)
      delete error.inner.DLError;
  }

  return error;
}

function wrapHandler(apiCall){
  return (req, res, next) => {
    apiCall(req, res, next)
      .catch(next);
  }
}

module.exports = {
  queryDatabase,
  generateError,
  wrapHandler
}