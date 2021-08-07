const { STATUS_CODES } = require('http');

function generateError(code, message){
  return {
    error: code,
    message: message || STATUS_CODES[code]
  }
}

module.exports = {
  generateError
}