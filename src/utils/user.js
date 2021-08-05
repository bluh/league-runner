const databaseUtils = require('./database');
const tedious = require('tedious');
const crypto = require('crypto');

function login(username, password){
  return new Promise((resolve, reject) => {
    databaseUtils.request("SELECT Salt FROM Users WHERE Username = @username AND Enabled = 1", 1, [{name: "username", type: tedious.TYPES.NVarChar, value: username}])
      .then(data => {
        const salt = data[0][0].value;
        crypto.pbkdf2(password, salt, process.env.PWORD_ITERATIONS * 1, process.env.PWORD_SIZE * 1, process.env.PWORD_DIGEST, (error, key) => {
          if(error){
            console.error(error);
            reject("Incorrect Username or Password");
          }else{
            databaseUtils.request("SELECT * FROM Users WHERE Username = @username AND Hash = @password AND Enabled = 1", 1, [
              {name: "username", type: tedious.TYPES.NVarChar, value: username},
              {name: "password", type: tedious.TYPES.Binary, value: key}
            ])
              .then(data => {
                if(data.length === 0){
                  console.error("No Username/Password pair");
                  reject("Incorrect Username or Password");
                }
                resolve(data);
              })
              .catch(err => {
                console.error(err);
                reject("Incorrect Username or Password");
              })
          }
        })
      })
      .catch(err => {
        console.error(err);
        reject("Incorrect Username or Password");
      })
  })
}

function register(username, password){
  return new Promise((resolve, reject) => {
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
              databaseUtils.request("INSERT INTO Users(Username, Hash, Salt, Enabled, Created) VALUES(@username, @hash, @salt, 1, @created)", 0, [
                {name: "username", type: tedious.TYPES.NVarChar, value: username},
                {name: "hash", type: tedious.TYPES.Binary, value: key},
                {name: "salt", type: tedious.TYPES.Binary, value: salt},
                {name: "created", type: tedious.TYPES.DateTime, value: new Date()},
              ])
                .then(data => {
                  resolve(data);
                })
            }
          })
        }
      })
  })
}

module.exports = {
  login,
  register
}