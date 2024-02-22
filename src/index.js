require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const apis = require('./api');

const app = express();

const production = (process.argv[2] === "production");

// Use middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": production 
        ? ["'self'", "https://unpkg.com"] // Don't allow eval in prod
        : ["'self'", "'unsafe-eval'", "https://unpkg.com", "'unsafe-inline'"] // Allow in dev for speed
    }
  }
}));
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
  if(typeof err === 'object' && err.error && err.DLError){
    res.status(err.error).json({
      error: err.error,
      message: err.message,
      inner: err.inner
    });
  }else{
    res.status(500).json(err);
  }
})

if(!production){
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
  
  app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Use static site routing
app.use('/', express.static('public'), (_, res) => {
  res.sendFile(path.resolve(__dirname, `../public/index_${production ? "prod" : "dev"}.html`));
});

const server = app.listen(process.env.APP_PORT);

// Stop server peacefully
process.on('SIGTERM', () => {
  server.close();
})