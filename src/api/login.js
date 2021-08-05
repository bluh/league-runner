const userUtils = require('../utils/user');

function registerApi(app) {
  app.post('/api/login', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password){
      userUtils.login(requestBody.username, requestBody.password)
        .then(() => {
          res.status(200).send(`Logged in as ${requestBody.username}`);
        })
        .catch(() => {
          res.status(401).send("Username or Password incorrect");
        })
    }else{
      res.status(400).send("Username or Password unspecified");
    }
  })
}

module.exports = {
  name: "Login API",
  registerApi
}