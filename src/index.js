require('dotenv').config();
const express = require('express');
const apis = require('./api');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

apis.forEach(v => {
  console.log('Registering API', v.name || v);
  v && v.registerApi(app);
});

app.listen(process.env.APP_PORT);