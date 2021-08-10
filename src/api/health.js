function registerApi(api) {
  api.get('/api/health/ping', (req, res) => {
    res.sendStatus(200);
  })
}


module.exports = {
  name: "Health API",
  registerApi
}