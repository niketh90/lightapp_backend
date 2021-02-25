'use strict';

let mailService = require('./send-grid-mailing-service'),
    sesMailService =  require('./sesEmail'), 
    utills = require('./utills'),
    // mongoDriver = require('./mongo-driver'),
    services = { 
        mailService, 
        utills,
        sesMailService
    };

module.exports = services;