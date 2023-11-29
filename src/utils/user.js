const databaseUtils = require('./database');
const tedious = require('tedious');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');

/**
 * Verify that a username/password matches a record in the database
 * 
 * @param {string} username User's username
 * @param {string} password User's password
 * @returns {Promise<{UserID: int, Username: string, Roles: string[]}>} Resolves with user data on success, or error message on failure
 */
function login(username, password){
  return new Promise((resolve, reject) => {
    databaseUtils.request("SELECT Salt FROM Users WHERE Username = @username AND Enabled = 1", 1, [{name: "username", type: tedious.TYPES.NVarChar, value: username}])
      .then(data => {
        const salt = data[0].Salt.value;
        crypto.pbkdf2(password, salt, process.env.PWORD_ITERATIONS * 1, process.env.PWORD_SIZE * 1, process.env.PWORD_DIGEST, (error, key) => {
          if(error){
            console.error(error);
            reject("Incorrect Username or Password");
          }else{
            databaseUtils.request("SELECT * FROM UserAndRoles WHERE Username = @username AND UserHash = @password", 0, [
              {name: "username", type: tedious.TYPES.NVarChar, value: username},
              {name: "password", type: tedious.TYPES.Binary, value: key}
            ])
              .then(data => {
                if(data.length === 0){
                  reject("Incorrect Username or Password");
                }else{
                  const userData = {
                    UserID: data[0].UserID.value,
                    Username: data[0].Username.value,
                    Roles: data.map(v => v.Role.value)
                  };
                  resolve(userData);
                }
              })
              .catch(() => {
                reject("Incorrect Username or Password");
              })
          }
        })
      })
      .catch(() => {
        reject("Incorrect Username or Password");
      })
  })
}

/**
 * Register a new user's username and password
 * 
 * @param {string} username New user's username
 * @param {string} password New user's password
 * @param {string} email New users's email
 * @returns {Promise<{UserID: int, Username: string, Roles: string[]}>} Resolves with user data on success, or error message on failure
 */
function register(username, password, email){
  return new Promise((resolve, reject) => {
    if(username.length < 3 || username.length > 20){
      reject("Username bad length");
    }else if(password.length < 5){
      reject("Password too short");
    }else{
      databaseUtils.request("SELECT User FROM Users WHERE User = @username", 0, [
        {name: "username", type: tedious.TYPES.NVarChar, value: username}
      ])
        .then(data => {
          if(data.length > 0){
            reject("Username in use");
          }else{
            const salt = crypto.randomBytes(process.env.SALT_SIZE * 1);
            crypto.pbkdf2(password, salt, process.env.PWORD_ITERATIONS * 1, process.env.PWORD_SIZE * 1, process.env.PWORD_DIGEST, (err, key) => {
              if(err){
                reject(err);
              }else{
                databaseUtils.request("AddUser", 0, [
                  {name: "Username", type: tedious.TYPES.NVarChar, value: username},
                  {name: "Email", type: tedious.TYPES.NVarChar, value: email},
                  {name: "Hash", type: tedious.TYPES.Binary, value: key},
                  {name: "Salt", type: tedious.TYPES.Binary, value: salt}
                ], true)
                  .then(data => {
                    const userData = {
                      UserID: data[0].UserID.value,
                      Username: username,
                      Roles: data.map(v => v.Role.value)
                    };
                    resolve(userData);
                  })
                  .catch(err => {
                    reject(err);
                  })
              }
            })
          }
        });
    }
  })
}

function generatePasswordResetCode(email, username) {
  return new Promise((resolve, reject) => {
    if(email == null && username == null){
      reject("No email or username provided");
    }else{
      const hash = crypto.randomBytes(process.env.PWRESET_SIZE * 1);
      databaseUtils.request("GeneratePasswordReset", 1, [
        { name: "Email", value: email, type: tedious.TYPES.NVarChar },
        { name: "Username", value: username, type: tedious.TYPES.NVarChar },
        { name: "Hash", value: hash, type: tedious.TYPES.Binary}
      ], true)
        .then((data) => {
          const email = data[0][""].value;
          resolve({email, hash});
        }).catch(err => {
          reject(err);
        });
    }
  });
}

function passwordReset(hash, password){
  return new Promise((resolve, reject) => {
    databaseUtils.request("SELECT u.Salt, u.ID, upr.CreatedAt FROM Users u JOIN UserPWReset upr ON upr.UserID = u.ID WHERE upr.Hash=@Hash AND upr.Enabled = 1", 1, [{name: "Hash", type: tedious.TYPES.Binary, value: hash}])
      .then(data => {
        if(data.length === 0){
          reject("No reset request found");
        }else{
          const salt = data[0].Salt.value;
          const userId = data[0].ID.value;
          const created = data[0].CreatedAt.value;
          if(moment().subtract(moment(created)).minutes() > 20){
            reject("Reset request timed out");
          }else{
            crypto.pbkdf2(password, salt, process.env.PWORD_ITERATIONS * 1, process.env.PWORD_SIZE * 1, process.env.PWORD_DIGEST, (error, key) => {
              if(error){
                console.error(error);
                reject("Incorrect Username or Password");
              }else{
                databaseUtils.request("UpdateUserPassword", 0, [
                  {name: "UserID", type: tedious.TYPES.Int, value: userId},
                  {name: "Hash", type: tedious.TYPES.Binary, value: key},
                ], true).then(() => {
                  resolve();
                })
              }
            })
          }
        }
      })
      .catch((ex) => {
        console.error(ex);
        reject("Incorrect Username or Password");
      })
  })
}

/**
 * Generates a JWT with supplied user data
 * @param {{UserID: int, Username: string, Roles: string[]}} userData
 * @returns {string} Token string
 */
function generateJWT(userData){
  const tokenData = {
    name: userData.Username
  };
  const tokenHeader = {
    expiresIn: '6hr',
    issuer: process.env.JWT_ISSUER,
    audience: userData.Roles,
    subject: `${userData.UserID}`
  }
  const token = jwt.sign(tokenData, process.env.JWT_TOKEN, tokenHeader);

  return token;
}

module.exports = {
  login,
  register,
  generatePasswordResetCode,
  passwordReset,
  generateJWT
}