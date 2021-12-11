require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const apis = require('./api');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Register APIs
apis.forEach(v => {
  console.log('Registering API: ', v.name || v);
  v && v.registerApi(app);
});

// Catch errors
app.use((err, _req, res, _next) => {
  if(typeof err === 'object' && err.error){
    res.status(err.error).json(err);
  }else{
    res.status(500).json(err);
  }
})

// Create and register swagger documentation
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drag League',
      version: '1.0.0',
    },
  },
  apis: ['./src/api/*.js', './src/types/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

console.log(swaggerSpec);

app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use backup routing
app.use('/', express.static('public'), (_, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

app.listen(process.env.APP_PORT);