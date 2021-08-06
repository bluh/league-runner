require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const apis = require('./api');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET))

apis.forEach(v => {
  console.log('Registering API: ', v.name || v);
  v && v.registerApi(app);
});

app.use('/', express.static('public'));

app.listen(process.env.APP_PORT);