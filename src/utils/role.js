const jwt = require('jsonwebtoken');

function getUserRoles(jwtToken) {
  return new Promise((resolve, reject) => {
    if(jwtToken){
      jwt.verify(jwtToken, process.env.JWT_TOKEN, (err, token) => {
        if(err){
          console.error(err);
          reject(err);
        }else{
          resolve(token.roles);
        }
      });
    }else{
      reject();
    }
  })
}

function authorize(roles) {
  return (req, res, next) => {
    const jwtToken = req.signedCookies.DLAccess;
    getUserRoles(jwtToken)
      .then(userRoles => {
        if(userRoles){
          if(roles && roles.length > 0 && userRoles.find(v => roles.includes(v.Name))){
            next();
          }else{
            res.sendStatus(401);
          }
        }else{
          res.sendStatus(401);
        }
      });
  }
}

module.exports = {
  getUserRoles,
  authorize
}