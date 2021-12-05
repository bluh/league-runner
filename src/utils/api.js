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

function getItemID() {
  return (req, res, next) => {
    const pathRegex = /^.*\/(\d+)(?=\/.*?)/;
    const path = req.path;
    const result = pathRegex.exec(path);
    if(result){
      res.locals.itemID = result[1] * 1;
    }else{
      res.locals.itemID = null;
    }
    next();
  }
}

module.exports = {
  generateError,
  getItemID
}