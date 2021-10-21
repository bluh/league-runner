const { STATUS_CODES } = require('http');

function generateError(code, message){
  return {
    error: code,
    message: message || STATUS_CODES[code]
  }
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