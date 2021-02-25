'use strict';


var users = require('./users.server.routes'),
    userPassword = require('./auth.server.routes'),
    routes = { 
        users,        
        userPassword
    };
module.exports = routes;
