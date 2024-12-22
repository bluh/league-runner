const userUtils = require('../utils/user');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');
const mailUtils = require('../utils/mail');

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
          const token = userUtils.generateJWT(userData);
          res
            .status(200)
            .cookie('DLAccess', token, {
              maxAge: 6 * 60 * 60 * 1000,
              signed: true,
              sameSite: true,
              secure: true,
              httpOnly: true
            })
            .json({
              id: userData.UserID,
              name: userData.Username,
              roles: userData.Roles
            });
        })
        .catch((err) => {
          console.error(err);
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
   *              - email
   *            properties:
   *              username:
   *                type: string
   *              password:
   *                type: string
   *              email:
   *                type: string
   *    responses:
   *      200:
   *        description: Response with the JWT login information
   */
  app.post('/api/user/register', (req, res) => {
    const requestBody = req.body;
    if(requestBody.username && requestBody.password && requestBody.email){
      userUtils.register(requestBody.username, requestBody.password, requestBody.email)
        .then((userData) => {
          const token = userUtils.generateJWT(userData);
          res
            .status(200)
            .cookie('DLAccess', token, {
              maxAge: 6 * 60 * 60 * 1000,
              signed: true,
              sameSite: true,
              secure: true,
              httpOnly: true
            })
            .json({
              id: userData.UserID,
              name: userData.Username,
              roles: userData.Roles
            });
        })
        .catch(err => {
          res.status(401).json(apiUtils.generateError(500, "Could not register", err));
        })
    }else{
      res.status(400).json(apiUtils.generateError(400, "Username, Password, and Email required"));
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
   * /api/user/reset:
   *  get:
   *    description: Sends a reset request to a user's email
   *    tags: [User]
   *    parameters:
   *    - name: email
   *      in: query
   *    - name: username
   *      in: query
   *    responses:
   *      200:
   *        description: An email has been sent to the user's email with a link to reset their password
   *  post:
   *    description: Resets a user's password with a given hash
   *    tags: [User]
   *    requestBody:
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            required:
   *              - hash
   *              - password
   *            properties:
   *              hash:
   *                type: string
   *              password:
   *                type: string
   *    responses:
   *      200:
   *        description: The password for the account with the given hash has been changed
   * 
   */
  app.get('/api/user/reset', (req, res) => {
    const requestQuery = req.query;
    userUtils.generatePasswordResetCode(requestQuery.email, requestQuery.username)
      .then(({hash, email}) => {
        mailUtils.sendResetEmail(hash.toString('base64'), email);
        res.status(200).send()
      })
      .catch(ex => {
        res.status(400).json(apiUtils.generateError(400, "Error creating reset request", ex));
      })
  });

  app.post('/api/user/reset', (req, res) => {
    const requestBody = req.body;
    const hash = Buffer.from(requestBody.hash, "base64");
    userUtils.passwordReset(hash, requestBody.password)
      .then(_ => {
        res.status(200).send();
      })
      .catch(ex => {
        res.status(400).json(apiUtils.generateError(400, "Error verifying reset request", ex));
      })
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