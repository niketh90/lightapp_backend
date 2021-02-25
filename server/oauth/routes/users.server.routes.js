'use strict';

var express = require('express');
var router = express.Router();

var users = require('../controllers/users/users.password.server.controller'),
	// userscrud = require('../controllers/users/users.curd.server.controller'),
	auth = require('../controllers/users/users.authorization.server.controller');
// userPassword =require('../controllers/users/users.password.server.controller');

// router.route('/login')
// 	.post(users.signin)

//  router.route('/signup')
// 	.post(users.signup)clear

// router.route('/auth/reset/:token')
// 	.get(users.validateResetToken);

// router.route('/auth/reset-password/:token')
// 	.post(users.reset);

// router.route('/password/reset/:token')
//  	.patch(users.reset);	


module.exports = router;
