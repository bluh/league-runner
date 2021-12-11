function ping(req, res){
  res.sendStatus(200);
}

function registerApi(api) {
  api.get('/api/health/ping', ping)
}


module.exports = {
  name: "Health API",
  registerApi,
  methods: {
    ping
  }
}