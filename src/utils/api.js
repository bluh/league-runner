const { STATUS_CODES } = require('http');

function generateError(code, message, inner = null){
  const error = {
    error: code,
    message: message || STATUS_CODES[code]
  };

  if(inner)
    error.inner = inner;

  return error;
}

function wrapHandler(apiCall){
  return (req, res, next) => {
    apiCall(req, res, next)
      .catch(next);
  }
}

module.exports = {
  generateError,
  wrapHandler
}