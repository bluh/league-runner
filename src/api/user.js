const userUtils = require('../utils/user');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');
const jwt = require('jsonwebtoken');

function registerApi(app) {
  app.post('/api/user/login', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password){
      userUtils.login(requestBody.username, requestBody.password)
        .then(userData => {
          const tokenData = {
            user: requestBody.username,
            id: userData.UserID,
            roles: userData.Roles
          };
          const token = jwt.sign(tokenData, process.env.JWT_TOKEN, { expiresIn: '6hr' });
          res
            .status(200)
            .cookie('DLAccess', token, {
              maxAge: 6 * 60 * 60 * 1000,
              signed: true,
              sameSite: true,
              secure: true,
              httpOnly: true
            })
            .json(tokenData);
        })
        .catch(() => {
          res.status(401).json(apiUtils.generateError(401));
        })
    }else{
      res.status(400).json(apiUtils.generateError(400));
    }
  })

  app.post('/api/user/register', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password){
      userUtils.register(requestBody.username, requestBody.password)
        .then((userData) => {
          const tokenData = {
            user: requestBody.username,
            id: userData.UserID,
            roles: userData.Roles
          };
          const token = jwt.sign(tokenData, process.env.JWT_TOKEN, { expiresIn: '6hr' });
          res
            .status(200)
            .cookie('DLAccess', token, {
              maxAge: 6 * 60 * 60 * 1000,
              signed: true,
              sameSite: true,
              secure: true,
              httpOnly: true
            })
            .json(tokenData);
        })
        .catch(() => {
          res.status(401).json(apiUtils.generateError(500, "Could not register"));
        })
    }else{
      res.status(400).json(apiUtils.generateError(400, "Could not register"));
    }
  })

  app.get('/api/user/logout', (req, res) => {
    res.clearCookie("DLAccess");
    res.status(200).send();
  })

  app.get('/api/user/info', (req, res) => {
    const jwtToken = req.signedCookies.DLAccess;
    roleUtils.getUserInfo(jwtToken)
      .then(userData => {
        res.status(200).json(userData)
      })
      .catch(err => {
        res.status(401).json(apiUtils.generateError(401, err));
      })
  })
}

module.exports = {
  name: "User API",
  registerApi
}