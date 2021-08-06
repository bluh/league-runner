const userUtils = require('../utils/user');
const roleUtils = require('../utils/role');
const jwt = require('jsonwebtoken');

function registerApi(app) {
  app.post('/api/login', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password){
      userUtils.login(requestBody.username, requestBody.password)
        .then(roles => {
          const token = jwt.sign({
            user: requestBody.username,
            roles: roles
          }, process.env.JWT_TOKEN, {
            expiresIn: '6hr'
          });
          res
            .status(200)
            .cookie('DLAccess', token, {
              maxAge: 6 * 60 * 60 * 1000,
              signed: true,
              sameSite: true,
              secure: true
            })
            .send(`Logged in as ${requestBody.username}`);
        })
        .catch(() => {
          res.status(401).send("Username or Password incorrect");
        })
    }else{
      res.status(400).send("Username or Password unspecified");
    }
  })

  app.post('/api/register', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password){
      userUtils.register(requestBody.username, requestBody.password)
        .then(() => {
          res.status(201).send(`Created new user: ${requestBody.username}`);
        })
        .catch(() => {
          res.status(401).send("Username in use");
        })
    }else{
      res.status(400).send("Username or Password unspecified");
    }
  })

  app.get('/api/roles', roleUtils.authorize(['User']), (req, res) => {
    const jwtToken = req.signedCookies.DLAccess;
    roleUtils.getUserRoles(jwtToken)
      .then(userRoles => {
        res.status(200).json(userRoles)
      })
      .catch(err => {
        res.status(401).send(err);
      })
  })
}

module.exports = {
  name: "Login API",
  registerApi
}