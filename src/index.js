require('dotenv').config();
const userUtils = require('./utils/user');

console.log('starting');

userUtils.login('Aadu', 'AadusPassword')
    .then(data => console.log('finally', data))
    .catch(err => console.error(err));