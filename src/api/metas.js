const roleUtils = require('../utils/role');
const databaseUtils = require('../utils/database');
const apiUtils = require('../utils/api');

function registerApi(api) {
  /**
   * @openapi
   * 
   * tags:
   *  name: Metas
   *  description: API calls for getting metadata
   * 
   * /api/metas/users:
   *  get:
   *    description: Gets a list of all users
   *    tags: [Metas]
   *    responses:
   *      200:
   *        description: The list of all users
   */
  api.get('/api/metas/users', roleUtils.authorize(['User']), (req, res) => {
    databaseUtils.request("SELECT * FROM MetasUsers", 0, null)
      .then(data => {
        const pivot = data.map(v => ({ID: v.ID.value, Username: v.Username.value}));
        res.json(pivot);
      })
      .catch(err => {
        res.json(apiUtils.generateError(500, err.message));
      })
  })
}


module.exports = {
  name: "Metas API",
  registerApi
}