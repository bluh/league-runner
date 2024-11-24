const tedious = require('tedious');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');


function getQueen(req, res){
  return apiUtils.queryDatabase(
    req,
    res,
    ["queenID"],
    {
      queryString: "SELECT * FROM QueenDetails WHERE QueenID=@QueenID",
      queryParams: [
        { name: "QueenID", type: tedious.TYPES.Int, param: "queenID" }
      ]
    },
    values => ({
      ID: values[0].QueenID.value,
      Name: values[0].Name.value,
      Pronouns: values[0].Pronouns.value,
      Hometown: values[0].Hometown.value,
      SocialMedia: values[0].SocialTypeId.value ? values.map(s => ({
        ID: s.SocialTypeId.value,
        Name: s.SocialName.value,
        URL: s.SocialURL.value
      })) : []
    })
  )
}

function registerApi(api){
  /**
   * @openapi
   * 
   * tags:
   *  name: Queen
   *  description: API calls for Queen management
   * 
   * /api/queen/{queenID}/:
   *  get:
   *    description: Get the Queen Details object
   *    tags: [Queen]
   *    parameters:
   *      - name: queenID
   *        in: path
   *        required: true
   *        type: integer
   *    responses:
   *      200:
   *        description: The Episode object
   */
  api.get('/api/queen/:queenID', roleUtils.authorize(['User']), apiUtils.wrapHandler(getQueen));
}

module.exports = {
  name: "Queen API",
  registerApi
}