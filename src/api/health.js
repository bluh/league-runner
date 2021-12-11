function ping(_req, res){
  res.sendStatus(200);
}

function registerApi(api) {
  /**
   * @openapi
   * 
   * tags:
   *  name: Health
   *  description: API calls for server health information
   * 
   * /api/health/ping:
   *  get:
   *    tags: [Health]
   *    description: Pings the server
   */
  api.get('/api/health/ping', ping)
}


module.exports = {
  name: "Health API",
  registerApi,
  methods: {
    ping
  }
}