const jwt = require('jsonwebtoken');
const apiUtils = require('./api');

/**
 * Returns a user's user data given their auth token
 * 
 * @param {string} jwtToken The auth token found in the user's cookies
 * @returns {Promise<{UserID: int, Username: string, Roles: string[]}>} The user's data, or an error
 */
function getUserInfo(jwtToken) {
  return new Promise((resolve, reject) => {
    if(jwtToken){
      jwt.verify(jwtToken, process.env.JWT_TOKEN, (err, token) => {
        if(err){
          console.error(err);
          reject(err);
        }else{
          resolve(token);
        }
      });
    }else{
      reject("No token supplied");
    }
  })
}

/**
 * Returns express middleware that only continues if user is in a role specified by the roles parameter
 * @param {string[]} roles Array of roles the user must be in
 * @returns Middleware to pass to express
 */
function authorize(roles) {
  return (req, res, next) => {
    const jwtToken = req.signedCookies.DLAccess;
    getUserInfo(jwtToken)
      .then(userData => {
        const userRoles = userData.roles;
        if(userRoles){
          if(roles && roles.length > 0 && userRoles.find(v => roles.includes(v.Name))){
            next();
          }else{
            res.status(401).json(apiUtils.generateError(401, "User not in role"));
          }
        }else{
          res.status(401).json(apiUtils.generateError(401, "User not in role"));
        }
      })
      .catch(() => {
        res.status(401).json(apiUtils.generateError(401, "Error authenticating user"))
      })
  }
}

module.exports = {
  getUserInfo,
  authorize
}