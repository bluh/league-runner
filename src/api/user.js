const userUtils = require('../utils/user');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');
const jwt = require('jsonwebtoken');

function registerApi(app) {
  /**
   * @openapi
   * tags:
   *  name: User
   *  description: API calls for user management
   * 
   * /api/user/login:
   *  post:
   *    description: Logs a user in
   *    tags: [User]
   *    requestBody:
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            required:
   *              - username
   *              - password
   *            properties:
   *              username:
   *                type: string
   *              password:
   *                type: string
   *    responses:
   *      200:
   *        description: Response with the JWT login information
   */
  app.post('/api/user/login', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password){
      userUtils.login(requestBody.username, requestBody.password)
        .then(userData => {
          const tokenData = {
            name: userData.Username,
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
          res.status(401).json(apiUtils.generateError(401, "Error logging in"));
        })
    }else{
      res.status(400).json(apiUtils.generateError(400, "Username and Password required"));
    }
  })

  
  /**
   * @openapi
   * /api/user/register:
   *  post:
   *    description: Registers a new user
   *    tags: [User]
   *    requestBody:
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            required:
   *              - username
   *              - password
   *            properties:
   *              username:
   *                type: string
   *              password:
   *                type: string
   *    responses:
   *      200:
   *        description: Response with the JWT login information
   */
  app.post('/api/user/register', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password){
      userUtils.register(requestBody.username, requestBody.password)
        .then((userData) => {
          const tokenData = {
            name: requestBody.username,
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
        .catch(err => {
          res.status(401).json(apiUtils.generateError(500, "Could not register", err));
        })
    }else{
      res.status(400).json(apiUtils.generateError(400, "Username and Password required"));
    }
  })


  /**
   * @openapi
   * /api/user/logout:
   *  get:
   *    description: Logs a user out
   *    tags: [User]
   *    responses:
   *      200:
   *        description: Clears the JWT cookie from a user's session
   */
  app.get('/api/user/logout', (_req, res) => {
    res.clearCookie("DLAccess");
    res.status(200).send();
  })
  

  /**
   * @openapi
   * /api/user/info:
   *  get:
   *    description: Gets info about the logged-in user
   *    tags: [User]
   *    responses:
   *      200:
   *        description: Returns the user's info
   */
  app.get('/api/user/info', (req, res) => {
    const jwtToken = req.signedCookies.DLAccess;
    roleUtils.getUserInfo(jwtToken)
      .then(userData => {
        res.status(200).json(userData)
      })
      .catch(err => {
        res.status(401).json(apiUtils.generateError(401, "Not logged in", err));
      })
  })
}

module.exports = {
  name: "User API",
  registerApi
}