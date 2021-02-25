// 'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	models = require('../../models'),
	nodemailer = require('nodemailer'),
	jwt = require('jsonwebtoken'),
	config = require('../../../config.server'),
	// moment = require('moment'),
	crypto = require('crypto'),
	appleSignin = require('apple-signin'),
	async = require('async'),
	{ OAuth2Client } = require("google-auth-library"),
	client = new OAuth2Client({
		clientId: config.google.clientID,
		// redirectUri: 
	});
crypto = require('crypto'),
	FB = require('fb'),
	multer = require('multer'),
	nunjucks = require('nunjucks'),
	path = require('path'),
	// ffmpeg = require('fluent-ffmpeg'),
	Storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, path.join(process.env.PWD, 'uploads'));
		},
		filename: function (req, file, callback) {
			// console.log("File", file)

			callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
		}
	}),
	uploadAllTypeOfFiles = multer({
		storage: Storage

	}),
	documentImage = uploadAllTypeOfFiles.single('videoUrl'),
	_ = require('lodash'),
	errorHandler = require('../errors.server.controller');


FB.options({
	appId: config.facebook.clientID,
	appSecret: config.facebook.clientSecret,
	version: 'v2.4'
})


exports.signup = function (req, response) {
	async.waterfall([
		function (done) {
			crypto.randomBytes(20, function (err, buffer) {
				var verificationToken = buffer.toString('hex');
				done(err, verificationToken);
			});
		},
		async function (verificationToken, done) {
			if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
				response.status(404).send({
					success: false,
					message: "Missing Credentials",
					statusCode: 404
				})
			}
			let existMail = await models.users.findOne({ email: req.body.email.toLowerCase() })
			if (existMail) {
				return response.status(400).send({
					success: false,
					message: "Email Already exist",
					statusCode: 400
				});
			}
			else {
				let user = new User({
					email: req.body.email,
					password: req.body.password,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					roles: [config.roles.user],
					provider: 'local',
					isPasswordSet: true,
					verifyEmailToken: verificationToken,
				});
				user.save((error, res) => {
					// console.log("Saved Response",res)
					if (error) {
						return response.status(400).send({
							success: false,
							message: errorHandler.getErrorMessage(error),
							statusCode: 400
						});
					}
					else {
						var transporter = nodemailer.createTransport({
							service: 'gmail',
							auth: {
								user: config.sendEmail.user,
								pass: config.sendEmail.pass
								// user:'info@lightforcancer.com',
								// pass:'MayTina2020$'
							}
						});

						var mailOptions = {
							from: 'info@lightforcancer.com',
							to: `${res.email}`,
							subject: 'Light App Email Verification',
							html: `<p font-family:"Courier New", Courier, monospace>Hello ${res.firstName}, <br><br>
						Thank you for signing up with <i>Light – Healing meditations for cancer warriors.</i><br><br>
						Please click on the following link or paste it into your browser to complete the verification of you account:<br><br>
				http://${req.headers.host}/auth/verify/${verificationToken} <br><br>
				Note: This link will expire in 1 hour. If you did not request to sign up, please ignore this email.<br>
				For any issues or problems, feel free to contact us at: <a href="url">info@lightforcancer.com.</a><br><br>
			Sincerely,<br>
			The Light team </p>`
						};
						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								console.log(error);
							}
						});
						var token = jwt.sign({
							data: res
						}, config.secret, {
							expiresIn: config.sessionExpire // in seconds
						});
						response.status(200).json({
							success: true,
							message: 'Email Verification Link sent',
							statusCode: 200
							// data: res
						});
					}
					delete user.__v;
					delete user.password;
					delete user.salt;
					req.auth = user;

				})

			}
		},]
		, function (err) {
			if (err) return next(err);
		})
}

exports.validateVerifyToken = function (req, response) {
	let token = req.params.token;
	models.users.findOne({
		verifyEmailToken: req.params.token,
		// resetPasswordExpires:{
		// 	$gt: Date.now()
		// }
	}, function (err, user) {

		if (!user) {
			return response.render('already-verified');
		}
		else 
		{
			models.users.findOneAndUpdate({ verifyEmailToken: req.params.token, }, { $set: { isVerified: true, verifyEmailToken: "" } }, (err, res) => {
				if (err) 
				{
					// response.status()
				}
				else {
					// response.render('email-verification', {
					// 	token
					// })
				
					// response.redirect('/verificationsuccess');
					response.redirect(config.verificationRoute.verify);
				}
			})

		}

	});
};


exports.signin = function (req, response, next) {

	let deviceType = req.body.deviceType,
		deviceToken = req.body.deviceToken
	if (!req.body.email || !req.body.password || !deviceType || !deviceToken) {
		return response.status(401).json({
			success: false,
			message: 'Authentication failed. Missing credentials.'
		});
	}
	models.users.findOne({ email: req.body.email.toLowerCase() }, (err, res) => {

		if (err) {
			return response.status(400).send({
				success: false,
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!res) {
			return response.status(401).json({
				success: false,
				message: 'email or password incorrect.'
			});
		}
		else if (res.isVerified === false) {
			return response.status(401).json({
				success: false,
				message: 'Authentication failed. Email is not Verified Not Allowed to Login.'
			});
		}
		else {
			if (res.isDeleted === true) {
				return response.status(401).json({
					success: false,
					message: 'email or password incorrect.'
				});
			}

			else {
				if (!res.authenticate(req.body.password)) {
					return response.status(401).json({
						success: false,
						message: 'email or password incorrect.'
					});
				}
				else {
					models.users.findOneAndUpdate({ _id: res._id }, { $set: { deviceDetails: { deviceType: deviceType, deviceToken: deviceToken, isPasswordSet: true } } }, (err, resp) => {
						if (err) {
							res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						}
						else {
							var token = jwt.sign({
								data: resp
							}, config.secret, {
								expiresIn: config.sessionExpire
							});
							let id = resp._id;
							models.users.find({
								_id: id
							})
								.populate([{
									path: 'userData.data'
								}])
								.exec(async (err, result) => {
									result = result[0]
									// console.log(result)
									if (err) {
										response.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										let arr = []
										arr.push(result)
										let d = result.dailyReminder
										let subscriptionDetail = await models.purchase.find({ userId: result._id })
										subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
										let purchase = subscriptionDetail[0] || subscriptionDetail
										if (purchase.subscriptionType === 'android') {


											response.status(200).send(
												{
													token: token,
													firstName: result.firstName,
													lastName: result.lastName,

													email: result.email,
													healingTime: result.healingTime,
													healingDays: result.healingDays,
													currentStreak: result.currentStreak,
													profileImage: result.profileImage,
													dailyReminder: d,
													isPasswordSet: result.isPasswordSet,
													// subscriptionDetail: purchase.androidReceiptDetails || {}

												}
											)
										}
										else if (purchase.subscriptionType === 'ios') {
											response.status(200).send(
												{
													token: token,
													firstName: result.firstName,
													lastName: result.lastName,
													email: result.email,
													healingTime: result.healingTime,
													healingDays: result.healingDays,
													currentStreak: result.currentStreak,
													profileImage: result.profileImage,
													dailyReminder: d,
													isPasswordSet: result.isPasswordSet,
													// subscriptionDetail: purchase.iosReceiptDetails || {}

												}
											)

										}
										else {
											response.status(200).send(
												{
													token: token,
													firstName: result.firstName,
													lastName: result.lastName,
													email: result.email,
													healingTime: result.healingTime,
													healingDays: result.healingDays,
													currentStreak: result.currentStreak,
													profileImage: result.profileImage,
													dailyReminder: d,
													isPasswordSet: result.isPasswordSet,
													// subscriptionDetail: {}

												}
											)


										}

									}
								})
						}
					})
				}
			}
		}

	})
};

exports.signInAdmin = function (req, response, next) {


	if (!req.body.email || !req.body.password) {
		return response.status(401).json({
			success: false,
			message: 'Authentication failed. Missing credentials.'
		});
	}
	models.users.findOne({ email: req.body.email }, (err, res) => {

		if (err) {
			return response.status(400).send({
				success: false,
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!res) {
			return response.status(401).json({
				success: false,
				message: 'Authentication failed. User not found.'
			});
		}

		else {
			if (res.isDeleted === true) {
				return response.status(401).json({
					success: false,
					message: 'Authentication failed. User not found.'
				});
			}

			else {
				if (!res.authenticate(req.body.password)) {
					return response.status(401).json({
						success: false,
						message: 'Authentication failed. Passwords did not match.'
					});
				}
				else {
					var token = jwt.sign({
						data: res
					}, config.secret, {
						expiresIn: config.sessionExpire
					});
					let id = res._id;
					models.users.find({
						_id: id
					})
						.populate([{
							path: 'userData.data'
						}])
						.exec((err, result) => {
							// console.log(result);
							if (err) {
								response.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								return response.status(200).send({
									success: true,
									token: token,
									roles: res.roles,
									id: res._id,
									email: res.email,
									userData: res.userData,
									// firstName: res.firstName
								});
							}
						})
				}
			}
		}

	})
};




/**
 * Signout
 */
exports.signoutAdmin = function (req, res) {
	res.status(200).send({
		'message': 'Logout Successfully',
		success: true,
		statusCode: 200
	});
};

exports.signout = function (req, res) {

	// Todo Expire a token on logout
	let user = req.user,
		deviceToken = req.body.deviceToken || req.query.deviceToken,
		deviceType = req.body.deviceType || req.query.deviceType;

	if (!deviceToken) {
		return res.status(404).json({ success: false, message: 'No Device Token Found.' });
	}

	if (!deviceType) {
		return res.status(404).json({ success: false, message: 'No Device Type Found.' });
	}

	// models.users.findOne({ _id: user._id }, function (err, userObj) {
	// 	console.log(err);
	// 	if (err) {
	// 		return res.status(400).send({
	// 			message: errorHandler.getErrorMessage(err)
	// 		});
	// 	}

	// 	if (!userObj) {
	// 		return res.status(400).json({ success: false, message: 'User not found.' });
	// 	} else {

	// 		let deviceDetails = userObj.deviceDeatils || [];

	// 		let token = { token: deviceToken, deviceType },
	// 			index = _.findIndex(deviceDetails, token);

	// 		// Pop the token while logout
	// 		if (index !== -1) {
	// 			deviceDetails.splice(index, 1);
	// 		}

	// 		models.users.findOneAndUpdate({ _id: user._id }, { $set: { deviceDetails: deviceDetails } }, function (err, user) {
	// 			if (err) {
	// 				return res.status(400).send({
	// 					message: errorHandler.getErrorMessage(err)
	// 				});
	// 			}
	res.status(200).send({
		success: true,
		'message': 'Loggedout Sucessfully',
		statusCode: 200
	});




},

	exports.changeEmailAdmin = function (req, response) {
		let email = req.body.email
		models.users.findOneAndUpdate({ _id: req.user._id }, { $set: { email: email } }, { new: true }, (err, user) => {
			if (err) {
				return response.status(400).send({
					success: false,
					message: errorHandler.getErrorMessage(err)
				})
			}
			else {
				return response.status(200).send({
					success: true,
					message: "Email Updated Successfully"
				})
			}
		})
	}
exports.changePassword = function (req, res) {
	// Init Variables

	var passwordDetails = req.body;
	if (req.user) {
		if (passwordDetails.newPassword) {
			models.users.findById(req.user._id, function (err, user) {
				if (!err && user) {
					if (user.authenticate(passwordDetails.currentPassword)) {
						if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
							user.password = passwordDetails.newPassword;

							user.save(function (err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									var token = jwt.sign({
										data: user
									}, config.secret, {
										expiresIn: config.sessionExpire // in seconds
									});

									res.status(200).json({
										success: true,
										message: 'Password Changed Successfully!!',
										token: token,
										statusCode: 200
									});
									var transporter = nodemailer.createTransport({
										service: 'gmail',
										auth: {
										user: config.sendEmail.user,
										pass: config.sendEmail.pass
											
										}
									});

									var mailOptions = {
										from: "info@lightforcancer.com",
										// from: config.sendEmail.from,
										// from: '"info@lightforcancer.com"<noreply@light.com>',
										to: user.email,
										subject: 'Security Alert',
										html: `Hi ${user.firstName},<br><br>
										Thank you for using <i>Light – Healing meditations for cancer warriors.</i><br><br>
										You are receiving this email as a confirmation that the password for your account has been successfully changed.<br><br>
										In case you did not change the password yourself, please change it immediately. <br><br>
										For any issues or problems, feel free to contact us at: info@lightforcancer.com<br><br>
										Sincerely,<br>
										The Light team`
									};

									transporter.sendMail(mailOptions, function (error, info) {
										if (error) {
											// console.log(error);
										}
									});
								}
							});
						} else {
							res.status(400).send({
								success: false,
								message: 'Passwords do not match'
							});
						}
					} else {
						res.status(400).send({
							success: false,
							message: 'Current password is incorrect'
						});
					}
				} else {
					res.status(400).send({
						success: false,
						message: 'User Not Found'
					});
				}
			});
		} else {
			res.status(400).send({
				success: false,
				message: 'Please provide a new password'
			});
		}
	} else {
		res.status(400).send({
			success: false,
			message: 'User is not signed in'
		});
	}
};


/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}
		user.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function (err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	}
};


exports.updateProfilePicture = function (req, response) {
	// let id = req.params.id;
	// console.log(req.body.profileImage)
	documentImage(req, response, (err) => {
		let body = {};
		if (err) {
			console.log(err)
			return response.status(400).send({ success: false, message: 'uploading failed.' });
		}

		else if (req.files) {
			if (req.files[0].filename.indexOf(' ') !== -1) {
				return response.status(400).send({ success: false, message: 'uploading failed no white spaces allowed.' });
			}

			else {
				body.profileImage = config.serverUrl + req.files[0].filename;
				models.users.findOneAndUpdate({ _id: req.user._id },
					{
						$set: body
					},
					{ new: true }, (err, res) => {
						console.log("errpr,",err)
						console.log("resposnse,",res)
						
						if (err) {
							console.log(err)
							response.status(400).send({
								success: false,
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							res = JSON.parse(JSON.stringify(res))
							response.status(200).send({
								success: true,
								data: res,
								statusCode: 200
							})
						}
					})
			}
		}
		// }
	})
}


exports.verified = function (req, res) {
	// Init Variables
	res.render('already-verified')
};

exports.appleSignIn = async (req, response) => {
	try {
		let code = req.body.access_token,
			deviceToken = req.body.deviceToken || req.query.deviceToken,
			deviceType = req.body.deviceType || req.query.deviceType;
		if (!code) 
		{
			return response.status(404).json({ success: false, message: 'Auth Code is Required.' });
		}

		const clientSecret = appleSignin.getClientSecret({
			clientID: "com.light.inc", // identifier of Apple Service ID.
			teamId: "C369434XXV", // Apple Developer Team ID.
			
			privateKeyPath: path.join(process.env.PWD, "AuthKey_RKA8QF4RB3.p8"),

			// path to private key associated with your client ID.
			keyIdentifier: "RKA8QF4RB3" // identifier of the private key.
		});
		const options = {
			clientID: "com.light.inc", // identifier of Apple Service ID.
			redirectUri: "http://localhost:3000/auth/apple/callback", // use the same value which you passed to authorisation URL.
			clientSecret: clientSecret
		};

		const tokens = await appleSignin.getAuthorizationToken(code, options);

		if (!tokens.id_token) {
			return response.status(500).send({
				success: false,
				message: err.message || "Something went wrong"
			})
		}

		let jsonToken = tokens.id_token
		// let jsonToken = "eyJraWQiOiI4NkQ4OEtmIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLmxpZ2h0Lm1pbmRmdWxuZXNzIiwiZXhwIjoxNTkwNjQ3NzkyLCJpYXQiOjE1OTA2NDcxOTIsInN1YiI6IjAwMDU0Mi5jODE1NzE2ZjIxNjg0OTQzOTc0YmJmNWNkODU0MDMzNy4wNzQ5IiwiYXRfaGFzaCI6IjFVQlU1Z3hIeGlzNWxaSFhIeThsb3ciLCJlbWFpbCI6Imphc2tpcmF0LnNlcmFwaGljQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSIsImF1dGhfdGltZSI6MTU5MDY0NzA0NSwibm9uY2Vfc3VwcG9ydGVkIjp0cnVlfQ.gU5cylN7pM_oml1u8xl-FKuiseHMGrQHUoX2Wsxzzb_xADElHVQ8eXgzCukzFErTjgI-sT1J6GQ6E7_UE_A19o6Apuc8D2CQesZHkpil6YgHEEI7ipycmY_7gBOPIt4kVNw6hQg_amA-MaJfYAg-KGtjSZJoB73qdtJyK_LzHiKzXyvKUR6qUNNPwTc6slWwJLr2Ey9vJ6u3ERYpDsKAci9Ea2xuERk49SFRWlzCedFI78pigwtUeu0n8FnTlGtai5OOqC1ExlqGjec7IOk22gHHKuaGS6IW-qQt_R1EUdLwwdamb_kACKTQ-I2sKl8wj1QuSaTxp3mlsZ77vGmyRg"

		let decode = JSON.parse(new Buffer(jsonToken.split('.')[1], 'base64').toString());
		if (!decode.email) {
			return response.status(500).send({
				success: false,
				message: err.message || "Something went wrong"
			})

		}
		let email = decode.email
		let user = await models.users.findOne({ email: email })
		if (user) {
			let token = jwt.sign({
				data: user
			}, config.secret, {
				expiresIn: config.sessionExpire // in seconds
			});
			let subscriptionDetail = await models.purchase.find({ userId: user._id })
			subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
			let purchase = subscriptionDetail[0] || subscriptionDetail
			if (purchase.subscriptionType === 'android') {

				return response.status(200).send({
					firstName: user.firstName,
					lastName: user.lastName,
					token: token,
					email: user.email,
					healingTime: user.healingTime,
					healingDays: user.healingDays,
					currentStreak: user.currentStreak,
					profileImage: user.profileImage,
					dailyReminder: user.dailyReminder,
					isPasswordSet: user.isPasswordSet,
					// subscriptionDetail: purchase.androidReceiptDetails
				})
			}
			else if (purchase.subscriptionType === 'ios') {

				return response.status(200).send({
					firstName: user.firstName,
					lastName: user.lastName,
					token: token,
					email: user.email,
					healingTime: user.healingTime,
					healingDays: user.healingDays,
					currentStreak: user.currentStreak,
					profileImage: user.profileImage,
					dailyReminder: user.dailyReminder,
					isPasswordSet: user.isPasswordSet,
					// subscriptionDetail: purchase.iosReceiptDetails
				})

			}
			else {

				return response.status(200).send({
					firstName: user.firstName,
					lastName: user.lastName,
					token: token,
					email: user.email,
					healingTime: user.healingTime,
					healingDays: user.healingDays,
					currentStreak: user.currentStreak,
					profileImage: user.profileImage,
					dailyReminder: user.dailyReminder,
					isPasswordSet: user.isPasswordSet,
					// subscriptionDetail: {}
				})


			}

		}
		if (!user) {
			let userToCreate = {
				roles: [2],
				firstName: "",
				lastName: "",
				isVerified: true,
				isPasswordSet: false,
				email: email,
				iosProvider: {
					id: decode.sub
				},
				provider: 'IOS',
				deviceDetails: {
					devicedeviceType: deviceType,
					deviceToken: deviceToken
				}
			}

			let newUser = await models.users.create(userToCreate);

			let token = jwt.sign({
				data: newUser
			}, config.secret, {
				expiresIn: config.sessionExpire // in seconds
			});
			let subscriptionDetail = await models.purchase.find({ userId: newUser._id })
			subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
			let purchase = subscriptionDetail[0] || subscriptionDetail
			if (purchase.subscriptionType === 'android') {

				response.status(200).send({
					firstName: newUser.firstName,
					lastName: newUser.lastName,
					token: token,
					email: newUser.email,
					healingTime: newUser.healingTime,
					healingDays: newUser.healingDays,
					currentStreak: newUser.currentStreak,
					profileImage: newUser.profileImage,
					dailyReminder: newUser.dailyReminder,
					isPasswordSet: newUser.isPasswordSet,
					// subscriptionDetail: purchase.androidReceiptDetails 
				})
	
			}
			else if (purchase.subscriptionType === 'ios') {

				response.status(200).send({
					firstName: newUser.firstName,
					lastName: newUser.lastName,
					token: token,
					email: newUser.email,
					healingTime: newUser.healingTime,
					healingDays: newUser.healingDays,
					currentStreak: newUser.currentStreak,
					profileImage: newUser.profileImage,
					dailyReminder: newUser.dailyReminder,
					isPasswordSet: newUser.isPasswordSet,
					// subscriptionDetail: purchase.iosReceiptDetails
				})
	

			}
			else {

				response.status(200).send({
					firstName: newUser.firstName,
					lastName: newUser.lastName,
					token: token,
					email: newUser.email,
					healingTime: newUser.healingTime,
					healingDays: newUser.healingDays,
					currentStreak: newUser.currentStreak,
					profileImage: newUser.profileImage,
					dailyReminder: newUser.dailyReminder,
					isPasswordSet: newUser.isPasswordSet,
					// subscriptionDetail:  {}
				})
	

			}
		}
	}
	catch (err) {
		return response.status(500).send({
			success: false,
			message: errorHandler.getErrorMessage(err) || "Something went wrong"
		})
	}
}

exports.googleSignIn = (req, res) => {
	let token = req.body.access_token || req.query.access_token,
		deviceToken = req.body.deviceToken || req.query.deviceToken,
		deviceType = req.body.deviceType || req.query.deviceType;

	if (!token) {
		return res.status(404).json({ success: false, message: 'No Token Found.' });
	}

	client.verifyIdToken(
		{
			idToken: token,
			audience: [config.google.clientID1, config.google.clientID2]
		},
		async function (e, login) {

			if (e) {
				console.log('Error sigining google', e);
				return res.status(401).send({ success: false, message: 'User Not Authenticated' });
			}
			else {

				let payload = login.getPayload()
				console.log('payload', payload);
				await models.users.findOne({ email: payload.email }, async (err, already) => {
					if (err) {
						res.status(400).send({
							success: false,
							message: errorHandler.getErrorMessage(err)
						});
					}
					else if (already) {
						let token = jwt.sign({
							data: already
						}, config.secret, {
							expiresIn: config.sessionExpire // in seconds
						});
						let subscriptionDetail = await models.purchase.find({ userId: already._id })
						subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
						let purchase = subscriptionDetail[0] || subscriptionDetail
						if (purchase.subscriptionType === 'android') {

							res.status(200).send({
								firstName: already.firstName,
								lastName: already.lastName,
								token: token,
								email: already.email,
								healingTime: already.healingTime,
								healingDays: already.healingDays,
								currentStreak: already.currentStreak,
								profileImage: already.profileImage,
								dailyReminder: already.dailyReminder,
								isPasswordSet: already.isPasswordSet,
								// subscriptionDetail: purchase.androidReceiptDetails 
	
							})
				
						}
						else if (purchase.subscriptionType === 'ios') {
			
							res.status(200).send({
								firstName: already.firstName,
								lastName: already.lastName,
								token: token,
								email: already.email,
								healingTime: already.healingTime,
								healingDays: already.healingDays,
								currentStreak: already.currentStreak,
								profileImage: already.profileImage,
								dailyReminder: already.dailyReminder,
								isPasswordSet: already.isPasswordSet,
								// subscriptionDetail: purchase.iosReceiptDetails 
	
							})
			
						}
						else {
			
							res.status(200).send({
								firstName: already.firstName,
								lastName: already.lastName,
								token: token,
								email: already.email,
								healingTime: already.healingTime,
								healingDays: already.healingDays,
								currentStreak: already.currentStreak,
								profileImage: already.profileImage,
								dailyReminder: already.dailyReminder,
								isPasswordSet: already.isPasswordSet,
								// subscriptionDetail:{}
							})
				
			
						}
					

					}
					else {
						User.upsertGoogleUser(token, payload, {
							deviceType,
							token: deviceToken
						}, function (err, user) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							}

							else {
								// console.log("User here")
								let fName = payload.given_name
								let lName = payload.family_name
								let token = jwt.sign({
									data: user
								}, config.secret, {
									expiresIn: config.sessionExpire // in seconds
								});
								// console.log("User", user)
								models.users.findOneAndUpdate({ 'googleProvider.id': payload.sub }, { $set: { deviceDetails: { deviceType: deviceType, deviceToken: deviceToken }, firstName: fName, lastName: lName } }, { new: true }, async (err, ress) => {
									let subscriptionDetail = await models.purchase.find({ userId: ress._id })
									subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
									let purchase = subscriptionDetail[0] || subscriptionDetail
									if (purchase.subscriptionType === 'android') {
										res.status(200).send({
											firstName: ress.firstName,
											lastName: ress.lastName,
											token: token,
											email: ress.email,
											healingTime: ress.healingTime,
											healingDays: ress.healingDays,
											currentStreak: ress.currentStreak,
											profileImage: ress.profileImage,
											dailyReminder: ress.dailyReminder,
											isPasswordSet: ress.isPasswordSet,
											// subscriptionDetail: purchase.androidReceiptDetails 
										})
									}
									else if (purchase.subscriptionType === 'ios') {
										res.status(200).send({
											firstName: ress.firstName,
											lastName: ress.lastName,
											token: token,
											email: ress.email,
											healingTime: ress.healingTime,
											healingDays: ress.healingDays,
											currentStreak: ress.currentStreak,
											profileImage: ress.profileImage,
											dailyReminder: ress.dailyReminder,
											isPasswordSet: ress.isPasswordSet,
											// subscriptionDetail:  purchase.iosReceiptDetails 
										})
						
									}
									else {
										res.status(200).send({
											firstName: ress.firstName,
											lastName: ress.lastName,
											token: token,
											email: ress.email,
											healingTime: ress.healingTime,
											healingDays: ress.healingDays,
											currentStreak: ress.currentStreak,
											profileImage: ress.profileImage,
											dailyReminder: ress.dailyReminder,
											isPasswordSet: ress.isPasswordSet,
											// subscriptionDetail:  {}
										})
						
									}
									
								})
							}
						});
					}

				})
			}
		});

},


	exports.facebookSignin = async (req, res, next) => {
		try {
			let token = req.body.access_token || req.query.access_token,
				deviceToken = req.body.deviceToken || req.query.deviceToken,
				deviceType = req.body.deviceType || req.query.deviceType;

			if (!token) {
				return res.status(404).json({ success: false, message: 'No Token Found.' });
			}

			FB.api('me', { fields: ['name', 'id', 'email'], access_token: token }, async function (userInfo) {
				if (userInfo.error) {
					// console.log('eRROR ', userInfo.error);
					return res.status(401).send(userInfo.error);
				}
				else {
					// console.log("Here is userInfo",userInfo)
					if (!userInfo.email) {
						let id = userInfo.id
						let alreadyExist = await models.users.findOne({ "facebookProvider.id": id })
						if (alreadyExist) {
							let token = jwt.sign({
								data: alreadyExist
							}, config.secret, {
								expiresIn: config.sessionExpire // in seconds
							});
							let subscriptionDetail = await models.purchase.find({ userId: alreadyExist._id })
							subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
							let purchase = subscriptionDetail[0] || subscriptionDetail
							if (purchase.subscriptionType === 'android') {

								res.status(200).send({
									firstName: alreadyExist.firstName,
									lastName: alreadyExist.lastName,
									token: token,
									email: alreadyExist.email,
									healingTime: alreadyExist.healingTime,
									healingDays: alreadyExist.healingDays,
									currentStreak: alreadyExist.currentStreak,
									profileImage: alreadyExist.profileImage,
									dailyReminder: alreadyExist.dailyReminder,
									isPasswordSet: alreadyExist.isPasswordSet,
									// subscriptionDetail: purchase.androidReceiptDetails 
								})
					
							}
							else if (purchase.subscriptionType === 'ios') {
				
								res.status(200).send({
									firstName: alreadyExist.firstName,
									lastName: alreadyExist.lastName,
									token: token,
									email: alreadyExist.email,
									healingTime: alreadyExist.healingTime,
									healingDays: alreadyExist.healingDays,
									currentStreak: alreadyExist.currentStreak,
									profileImage: alreadyExist.profileImage,
									dailyReminder: alreadyExist.dailyReminder,
									isPasswordSet: alreadyExist.isPasswordSet,
									// subscriptionDetail: purchase.iosReceiptDetails 
								})
					
				
							}
							else {
				
								res.status(200).send({
									firstName: alreadyExist.firstName,
									lastName: alreadyExist.lastName,
									token: token,
									email: alreadyExist.email,
									healingTime: alreadyExist.healingTime,
									healingDays: alreadyExist.healingDays,
									currentStreak: alreadyExist.currentStreak,
									profileImage: alreadyExist.profileImage,
									dailyReminder: alreadyExist.dailyReminder,
									isPasswordSet: alreadyExist.isPasswordSet,
									// subscriptionDetail:  {}
								})
				
							}
					


						}
						else {
							let displayName = userInfo.name
							let input = displayName.split(" ")

							let fName = input[0],
								lName = input[1]

							let userToCreate = {
								roles: [2],
								firstName: fName,
								lastName: lName,
								isVerified: true,
								isPasswordSet: false,
								email: "",
								facebookProvider: {
									id: userInfo.id,
									token: token,
									name: userInfo.name,
								},
								provider: 'facebook',
								deviceDetails: {
									devicedeviceType: deviceType,
									deviceToken: deviceToken
								}
							}

							let newUser = await models.users.create(userToCreate);

							let signInToken = jwt.sign({
								data: newUser
							}, config.secret, {
								expiresIn: config.sessionExpire // in seconds
							});
							let subscriptionDetail = await models.purchase.find({ userId: newUser._id })
							subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
							let purchase = subscriptionDetail[0] || subscriptionDetail
							
							if (purchase.subscriptionType === 'android') {

								res.status(200).send({
									firstName: newUser.firstName,
									lastName: newUser.lastName,
									token: signInToken,
									email: newUser.email,
									healingTime: newUser.healingTime,
									healingDays: newUser.healingDays,
									currentStreak: newUser.currentStreak,
									profileImage: newUser.profileImage,
									dailyReminder: newUser.dailyReminder,
									isPasswordSet: newUser.isPasswordSet,
									// subscriptionDetail: purchase.androidReceiptDetails 
								})
					
							}
							else if (purchase.subscriptionType === 'ios') {
				
								res.status(200).send({
									firstName: newUser.firstName,
									lastName: newUser.lastName,
									token: signInToken,
									email: newUser.email,
									healingTime: newUser.healingTime,
									healingDays: newUser.healingDays,
									currentStreak: newUser.currentStreak,
									profileImage: newUser.profileImage,
									dailyReminder: newUser.dailyReminder,
									isPasswordSet: newUser.isPasswordSet,
									// subscriptionDetail: purchase.iosReceiptDetails 
								})
					
				
							}
							else {
				
								res.status(200).send({
									firstName: newUser.firstName,
									lastName: newUser.lastName,
									token: signInToken,
									email: newUser.email,
									healingTime: newUser.healingTime,
									healingDays: newUser.healingDays,
									currentStreak: newUser.currentStreak,
									profileImage: newUser.profileImage,
									dailyReminder: newUser.dailyReminder,
									isPasswordSet: newUser.isPasswordSet,
									// subscriptionDetail: {}
								})
					
				
							}
							
						}
					}
					else {
						let email = userInfo.email
						let newUser = await models.users.findOne({ email: email })
						if (newUser) {
							let token = jwt.sign({
								data: newUser
							}, config.secret, {
								expiresIn: config.sessionExpire // in seconds
							});
							let subscriptionDetail = await models.purchase.find({ userId: newUser._id })
							subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
							let purchase = subscriptionDetail[0] || subscriptionDetail
							if (purchase.subscriptionType === 'android') {
								res.status(200).send({
									firstName: newUser.firstName,
									lastName: newUser.lastName,
									token: token,
									email: newUser.email,
									healingTime: newUser.healingTime,
									healingDays: newUser.healingDays,
									currentStreak: newUser.currentStreak,
									profileImage: newUser.profileImage,
									dailyReminder: newUser.dailyReminder,
									isPasswordSet: newUser.isPasswordSet,
									// subscriptionDetail: purchase.androidReceiptDetails 
								})
					
							}
							else if (purchase.subscriptionType === 'ios') {
				
								res.status(200).send({
									firstName: newUser.firstName,
									lastName: newUser.lastName,
									token: token,
									email: newUser.email,
									healingTime: newUser.healingTime,
									healingDays: newUser.healingDays,
									currentStreak: newUser.currentStreak,
									profileImage: newUser.profileImage,
									dailyReminder: newUser.dailyReminder,
									isPasswordSet: newUser.isPasswordSet,
									// subscriptionDetail:  purchase.iosReceiptDetails
								})
				
							}
							else {
				
								res.status(200).send({
									firstName: newUser.firstName,
									lastName: newUser.lastName,
									token: token,
									email: newUser.email,
									healingTime: newUser.healingTime,
									healingDays: newUser.healingDays,
									currentStreak: newUser.currentStreak,
									profileImage: newUser.profileImage,
									dailyReminder: newUser.dailyReminder,
									isPasswordSet: newUser.isPasswordSet,
									// subscriptionDetail: {}
								})
				
							}
						

						}
						if (!newUser) {
							User.upsertFbUser(token, userInfo, {
								deviceType,
								token: deviceToken
							}, function (err, user) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								}
								else {

									let displayName = userInfo.name
									let input = displayName.split(" ")

									let fName = input[0],
										lName = input[1]
									let token = jwt.sign({
										data: user, displayName
									}, config.secret, {
										expiresIn: config.sessionExpire // in seconds
									});

									models.users.findOneAndUpdate({ 'facebookProvider.id': userInfo.id }, { $set: { deviceDetails: { deviceType: deviceType, deviceToken: deviceToken }, firstName: fName, lastName: lName } }, { new: true }, async (err, ress) => {
										let subscriptionDetail = await models.purchase.find({ userId: ress._id })
										subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
										let purchase = subscriptionDetail[0] || subscriptionDetail
										if (purchase.subscriptionType === 'android') {
											res.status(200).send({
												firstName: ress.firstName,
												lastName: ress.lastName,
												token: token,
												email: ress.email,
												healingTime: ress.healingTime,
												healingDays: ress.healingDays,
												currentStreak: ress.currentStreak,
												profileImage: ress.profileImage,
												dailyReminder: ress.dailyReminder,
												isPasswordSet: ress.isPasswordSet,
												// subscriptionDetail: purchase.androidReceiptDetails
											})
								
										}
										else if (purchase.subscriptionType === 'ios') {
							
											res.status(200).send({
												firstName: ress.firstName,
												lastName: ress.lastName,
												token: token,
												email: ress.email,
												healingTime: ress.healingTime,
												healingDays: ress.healingDays,
												currentStreak: ress.currentStreak,
												profileImage: ress.profileImage,
												dailyReminder: ress.dailyReminder,
												isPasswordSet: ress.isPasswordSet,
												// subscriptionDetail:  purchase.iosReceiptDetails
											})
										}
										else {
											res.status(200).send({
												firstName: ress.firstName,
												lastName: ress.lastName,
												token: token,
												email: ress.email,
												healingTime: ress.healingTime,
												healingDays: ress.healingDays,
												currentStreak: ress.currentStreak,
												profileImage: ress.profileImage,
												dailyReminder: ress.dailyReminder,
												isPasswordSet: ress.isPasswordSet,
												// subscriptionDetail:  {}
											})
							
										}
									
									})
								}
							});
						}
					}
				}

			});


		}
		catch (err) {
			return response.status(500).send({
				success: false,
				message: errorHandler.getErrorMessage(err) || "Something went wrong"
			})

		}
	}

	exports.success = function (req, res) {
		// Init Variables
		res.render('email-verification')
	};