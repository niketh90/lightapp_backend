'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	// User = mongoose.model('User'),
	models = require('../../models'),
	async = require('async'),
	crypto = require('crypto'),
	// services = require('../../services'),
	nodemailer = require('nodemailer'),
	config = require('../../../config.server'),
	jwt = require('jsonwebtoken');

/**
 * Forgot for reset password (forgot POST)
 */

exports.forgot = function (req, res, next) {
	async.waterfall([
		// Generate random token
		function (done) {
			crypto.randomBytes(20, function (err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},

		function (token, done) {
			if (req.body.email) {
				models.users.findOne({
					email: req.body.email.toLowerCase()
				}, '-salt -password', function (err, user) {
					if (!user) {
						return res.status(400).send({
							success: false,
							message: 'No account with this email has been found.',
							statusCode: 400
						});
					}
					else if (user.isVerified == false) {
						return res.status(400).send({
							success: false,
							message: 'Cannot send Verification. Email Not Verified',
							statusCode: 400
						});
					}
					else {
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

						user.save(function (err) {
							done(err, token, user);
						});
					}
				});
			} else {
				return res.status(400).send({
					success: false,
					message: 'Username field must not be blank',
					statusCode: 400
				});
			}
		},
		function (token, user, done) {
			console.log(`http://${req.headers.host}/auth/reset/${token}`);

			let emailHTML = `Hello ${user.firstName},<br><br>
			Thank you for using <i>Light – Healing meditations for cancer warriors.</i><br><br>
			You are receiving this email because you have requested to reset the password for your account. Please click on the following link or paste it into your browser to change your password:
.<br><br>
		  http://${req.headers.host}/auth/reset/${token} <br><br>
		  Note: This link will expire in 1 hour. If you did not request to change your password, please ignore this email.
		  <br><br>
		  For any issues or problems, feel free to contact us at: <a href="url">info@lightforcancer.com</a><br><br>
	  Sincerely,<br>
	  The Light team </p>`
			done(null, emailHTML, user);
		},
		// If valid email, send reset email using service

		function (emailHTML, user, done) {
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: config.sendEmail.user,
					pass: config.sendEmail.pass
				}
			});

			var mailOptions = {
				// from: '"info@lightforcancer.com"<noreply@light.com>',
				from: 'info@lightforcancer.com',
				to: user.email,
				subject: 'Light App Password Reset',
				html: emailHTML
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					res.status(200).send({
						success: true,
						message: 'An email has been sent to ' + user.email + ' with further instructions.',
						statusCode: 200
					});
				}
				// done(err)
				done(error);
			});
		}
	], function (err) {
		if (err) return next(err);
	});
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
	let token = req.params.token;
	models.users.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function (err, user) {

		if (!user) {
			return res.redirect('/password/reset/invalid');
		}
		else {
			res.render('password-reset', {
				token
			})
			// res.redirect('/password/reset/' + req.params.token);
		}

	});
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
	// Init Variables
	var passwordDetails = req.body;
	// console.log("yes in AUth")
	// console.log("passwordDetails", passwordDetails);


	async.waterfall([

		function (done) {
			models.users.findOne({
				resetPasswordToken: req.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function (err, user) {
				if (!err && user) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.password = req.body.newPassword;
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;


						user.save(function (err) {
							if (err) {
								return res.status(400).send({
									status: 0,
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								var token = jwt.sign({ data: user }, config.secret, {
									expiresIn: config.sessionExpire // in seconds
								});
								res.json({ status: 1, token: token });
								// res.render('password-changed', {
								// 	token
								// })
							}
						});
					} else {
						return res.status(400).send({
							status: 0,
							message: 'Passwords do not match'
						});
					}
				} else {
					return res.status(400).send({
						status: 0,
						message: 'Password reset token is invalid or has expired.'
					});
				}
			});
		},
		function (user, done) {
			res.render('templates/reset-password-confirm-email', {
				name: user.displayName,
				appName: config.app.title
			}, function (err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service

		function (emailHTML, user, done) {
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: config.sendEmail.user,
					pass: config.sendEmail.pass
				}
			});

			var mailOptions =
			{
				from: 'info@lightforcancer.com',
				// from: config.sendEmail.from,
				to: user.email,
				subject: 'Light App Password Changed',
				html: emailHTML
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				}
				else {
					res.status(200).send({
						status: 1,
						message: 'Password Reset Successful'
					});
				}
			});
		}
	], function (err) {
		if (err) return next(err);
	});
};


exports.success = function (req, res) {
	// Init Variables
	res.render('password-changed')
};
exports.error = function (req, res) {
	// Init Variables
	res.render('password-error')
};