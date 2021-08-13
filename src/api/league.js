const tedious = require('tedious');
const roleUtils = require('../utils/role');
const apiUtils = require('../utils/api');
const databaseUtils = require('../utils/database');


function registerApi(app){
  app.get('/api/leagues', (req, res) => {
    const jwtToken = req.signedCookies.DLAccess;
    roleUtils.getUserInfo(jwtToken)
      .then((userData) => {
        databaseUtils.request('SELECT * FROM UserAndLeagues WHERE UserID=@UserID', 0, [
          {name: "UserID", type: tedious.TYPES.Int, value: userData.id}
        ])
          .then((data) => {
            const responseData = data.map(values => ({
              id: values.LeagueID.value,
              name: values.LeagueName.value,
              description: values.LeagueDescription.value,
              owner: values.Owner.value
            }))
            res.status(200).json(responseData);
          })
      })
      .catch(err => {
        res.status(500).send(err);
      })
  })

  app.get('/api/league/*', apiUtils.getItemID(), (req, res) => {
    const itemID = res.locals.itemID;
    if(itemID === null || itemID === undefined){
      res.status(400).json(apiUtils.generateError(400, "Invalid league ID"));
    }else{
      databaseUtils.request('SELECT * FROM Leagues WHERE ID=@ID AND Enabled=1', 0, [
        {name: "ID", type: tedious.TYPES.Int, value: itemID}
      ])
        .then((data) => {
          const responseData = data.map(values => ({
            id: values.ID.value,
            name: values.Name.value,
            description: values.Description.value
          }))
          res.status(200).json(responseData);
        })
    }
  })
}

module.exports = {
  name: "League API",
  registerApi
}