'use strict';

var express = require('express');
var router = express.Router();

var admin = require('../controllers/admin.profile.server.controllers'),
    auth = require('../../oauth/controllers/users/users.authorization.server.controller');

router.route('/')
    .get(admin.getAdmin)

module.exports = router;
