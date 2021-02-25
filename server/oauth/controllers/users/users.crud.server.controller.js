'use strict';
let mongoose = require('mongoose'),
    async = require('async'),
    models = require('../../models'),
    config = require('../../../config.server'),
    crypto = require('crypto'),
    multer = require('multer'),
    path = require('path'),
    nodemailer = require('nodemailer'),
    jwt = require("jsonwebtoken"),
    moment = require('moment'),
    ffmpeg = require('fluent-ffmpeg'),
    _ = require('lodash'),
    Storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, path.join(process.env.PWD, 'uploads'));
        },
        filename: function (req, file, callback) {
            // console.log("file",file)
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    }),
    uploadAllTypeOfFiles = multer({
        storage: Storage
    }),
    documentImage = uploadAllTypeOfFiles.single('videoUrl'),
    errorHandler = require('../errors.server.controller');



var crud = {

    getUsersList(req, res) {
        let params = req.query;
        models.users.aggregate([{
            $match: {
                "roles": 2
            }
        },
        {
            $match: {
                $or: [{
                    firstName: {
                        $regex: new RegExp(params.text, 'i')
                    }
                }, {
                    email: {
                        $regex: new RegExp(params.text, 'i')
                    }
                },
                {
                    lastName: {
                        $regex: new RegExp(params.text, 'i')
                    }
                },
                {
                    provider: {
                        $regex: new RegExp(params.text, 'i')
                    }
                }

                ]
            }
        }
        ])
            .exec((err, result) => {

                if (err) {
                    res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    res.status(200).json(result);
                }
            })
    },


    getAdmin(req, response) {
        // console.log("request",req.user._id)
        models.users.findOne({
            _id: req.user._id
        }, (err, res) => {
            // console.log("res", res)
            if (err) {
                response.status(400).send({
                    success: false,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res = JSON.parse(JSON.stringify(res))
                response.status(200).send({

                    success: true,
                    email: res.email,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    statusCode: 200
                })
            }
        })

    },
    async updateProfile(req, response) {
        try {
            let { firstName, lastName, email, dailyReminder } = req.body
            let jsonToUpdate = {}
            if (firstName) jsonToUpdate.firstName = firstName
            if (lastName) jsonToUpdate.lastName = lastName;
            // if (email) jsonToUpdate.email = email;
            if (dailyReminder || dailyReminder === "") jsonToUpdate.dailyReminder = dailyReminder;
            let user = await models.users.findOne({ _id: req.user._id })
            if (!user) {

                response.status(400).send({
                    success: false,
                    message: "User Not Found"
                });

            }

            else {

                models.users.findOneAndUpdate({
                    _id: req.user._id
                }, { $set: jsonToUpdate }, {
                    new: true
                }, async (err, ress) => {


                    if (err) {
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    else {
                        let subscriptionDetail = await models.purchase.find({ userId: ress._id })
                        subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
                        let purchase = subscriptionDetail[0] || subscriptionDetail
                        if (purchase.subscriptionType === 'android') {


                            response.status(200).send(
                                {
                                    success: true,
                                    message: "Details Changed Successfully",
                                    firstName: ress.firstName,
                                    lastName: ress.lastName,
                                    email: ress.email,
                                    healingTime: ress.healingTime,
                                    healingDays: ress.healingDays,
                                    currentStreak: ress.currentStreak,
                                    profileImage: ress.profileImage,
                                    dailyReminder: ress.dailyReminder,
                                    isPasswordSet: ress.isPasswordSet,
                                    statusCode: 200,
                                    // subscriptionDetail: purchase.androidReceiptDetails || {}

                                }
                            )
                        }
                        else if (purchase.subscriptionType === 'ios') {
                            response.status(200).send(
                                {

                                    success: true,
                                    message: "Details Changed Successfully",
                                    firstName: ress.firstName,
                                    lastName: ress.lastName,
                                    email: ress.email,
                                    healingTime: ress.healingTime,
                                    healingDays: ress.healingDays,
                                    currentStreak: ress.currentStreak,
                                    profileImage: ress.profileImage,
                                    dailyReminder: ress.dailyReminder,
                                    isPasswordSet: ress.isPasswordSet,
                                    statusCode: 200,
                                    // subscriptionDetail: purchase.iosReceiptDetails || {}

                                }
                            )

                        }
                        else {
                            response.status(200).send(
                                {
                                    success: true,
                                    message: "Details Changed Successfully",
                                    firstName: ress.firstName,
                                    lastName: ress.lastName,
                                    email: ress.email,
                                    healingTime: ress.healingTime,
                                    healingDays: ress.healingDays,
                                    currentStreak: ress.currentStreak,
                                    profileImage: ress.profileImage,
                                    dailyReminder: ress.dailyReminder,
                                    isPasswordSet: ress.isPasswordSet,
                                    statusCode: 200,

                                    // subscriptionDetail: {}

                                }
                            )


                        }
                    }
                })
            }
        }
        catch (err) {
            return response.status(500).send({
                success: false,
                message: err.message || "Something went wrong"
            })
        }
    },

    deleteUser(req, response) {
       
        models.users.findOneAndDelete({
            _id: req.params.id
        })
            .exec(function (err, result1) {
                if (err) {
                    response.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                else {
                    models.ratings.deleteMany({ userId: req.params.id }, (err, res) => {
                        if (err) {
                            response.status(400).send({
                                success: false,
                                message: errorHandler.getErrorMessage(err)
                            });
                        }
                        else {
                            models.sessionstats.deleteMany({ userId: req.params.id }, (err, resfinal) => {
                                if (err) {
                                    response.status(400).send({
                                        success: false,
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                }
                                else {
                                    response.status(200).json({
                                        success: true,
                                        message: "Participant Deleted",
                                        statusCode: 200
                                    });
                                }
                            })
                        }
                    })
                }
            })

    },

    updateStats(req, response) {

        let sessionId = req.body.sessionId
        let date = req.body.date
        if (!sessionId || !date) {
            response.status(400).send({
                success: false,
                message: "Date and sessionId required"
            })
        }
        else {
            models.sessions.findOne({ _id: sessionId }, (err, res) => {
                if (err) {
                    response.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    })

                }
                else if (!res) {
                    response.status(400).send({
                        success: false,
                        message: "Session Not Found"
                    })
                }
                else {
                    let minutesToUpdate = res.sessionTime

                    models.users.findOne({ _id: req.user._id }, async (err, res1) => {
                        if (err) {
                            response.status(400).send({
                                success: false,
                                message: errorHandler.getErrorMessage(err)
                            })

                        }
                        else if (!res1) {
                            response.status(400).send({
                                success: false,
                                message: "User Not Found"
                            })

                        }
                        else {
                            Date.prototype.UTCfloor = function () {
                                return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()));
                            };
                            let d = new Date(date)
                           
                            let lastPlay = res1.lastPlayed
                            let newMin = res1.healingTime + minutesToUpdate
                            let daysToUpdate = res1.healingDays + 1
                            let streakToUpdate = res1.currentStreak + 1
                            
                            console.log(d.toString() === lastPlay.toString())
                            if (d.toString() === lastPlay.toString()) {
                                // let here = new Date().UTCfloor()-d 
                                // console.log(here/86400000)

                                let sessionStat = await models.sessionstats.create({ userId: req.user._id, sessionId: sessionId, authorId: res.sessionAuthor })

                                models.users.findOneAndUpdate({ _id: req.user._id }, { $set: { healingTime: newMin } }, { new: true }, async (err, responsefinal) => {
                                    if (err) {
                                        response.status(400).send({
                                            success: false,
                                            message: errorHandler.getErrorMessage(err)
                                        })
                                    }
                                    else {
                                        let subscriptionDetail = await models.purchase.find({ userId: responsefinal._id })
                                        subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
                                        let purchase = subscriptionDetail[0] || subscriptionDetail
                                        if (purchase.subscriptionType === 'android') {


                                            response.status(200).send(
                                                {
                                                    message: "Healing Minutes Updated Succesfully",
                                                    firstName: responsefinal.firstName,
                                                    lastName: responsefinal.lastName,
                                                    email: responsefinal.email,
                                                    healingTime: responsefinal.healingTime,
                                                    healingDays: responsefinal.healingDays,
                                                    currentStreak: responsefinal.currentStreak,
                                                    profileImage: responsefinal.profileImage,
                                                    dailyReminder: responsefinal.dailyReminder,
                                                    isPasswordSet: responsefinal.isPasswordSet,
                                                    // subscriptionDetail: purchase.androidReceiptDetails || {}

                                                }
                                            )
                                        }
                                        else if (purchase.subscriptionType === 'ios') {
                                            response.status(200).send(
                                                {

                                                    message: "Healing Minutes Updated Succesfully",
                                                    firstName: responsefinal.firstName,
                                                    lastName: responsefinal.lastName,
                                                    email: responsefinal.email,
                                                    healingTime: responsefinal.healingTime,
                                                    healingDays: responsefinal.healingDays,
                                                    currentStreak: responsefinal.currentStreak,
                                                    profileImage: responsefinal.profileImage,
                                                    dailyReminder: responsefinal.dailyReminder,
                                                    isPasswordSet: responsefinal.isPasswordSet,
                                                    // subscriptionDetail: purchase.iosReceiptDetails || {}

                                                }
                                            )

                                        }
                                        else {
                                            response.status(200).send(
                                                {
                                                    message: "Healing Minutes Updated Succesfully",
                                                    firstName: responsefinal.firstName,
                                                    lastName: responsefinal.lastName,
                                                    email: responsefinal.email,
                                                    healingTime: responsefinal.healingTime,
                                                    healingDays: responsefinal.healingDays,
                                                    currentStreak: responsefinal.currentStreak,
                                                    profileImage: responsefinal.profileImage,
                                                    dailyReminder: responsefinal.dailyReminder,
                                                    isPasswordSet: responsefinal.isPasswordSet,
                                                    // subscriptionDetail: {}

                                                }
                                            )
                                        }
                                    }
                                })
                            }
                            else {
                                console.log("This Block")
                                // let here = new Date(d).UTCfloor()-lastPlay
                          
                                let sessionStat = await models.sessionstats.create({ userId: req.user._id, sessionId: sessionId, authorId: res.sessionAuthor })
                                models.users.findOneAndUpdate({ _id: req.user._id }, { $set: { healingTime: newMin, healingDays: daysToUpdate, currentStreak: streakToUpdate, lastPlayed: d } }, { new: true }, async (err, responsefirstt) => {
                                    if (err) {
                                        response.status(400).send({
                                            success: false,
                                            message: errorHandler.getErrorMessage(err)
                                        })
                                    }
                                    else {
                                        let subscriptionDetail = await models.purchase.find({ userId: responsefirstt._id })
                                        subscriptionDetail = _.orderBy(subscriptionDetail, ['created_at'], ['desc']);
                                        let purchase = subscriptionDetail[0] || subscriptionDetail
                                        if (purchase.subscriptionType === 'android') {

                                            response.status(200).send(
                                                {
                                                    message: "Stats Updated Succesfully",
                                                    firstName: responsefirstt.firstName,
                                                    lastName: responsefirstt.lastName,

                                                    email: responsefirstt.email,
                                                    healingTime: responsefirstt.healingTime,
                                                    healingDays: responsefirstt.healingDays,
                                                    currentStreak: responsefirstt.currentStreak,
                                                    profileImage: responsefirstt.profileImage,
                                                    dailyReminder: responsefirstt.dailyReminder,
                                                    isPasswordSet: responsefirstt.isPasswordSet,
                                                    // subscriptionDetail: purchase.androidReceiptDetails || {}

                                                }
                                            )
                                        }
                                        else if (purchase.subscriptionType === 'ios') {
                                            response.status(200).send(
                                                {

                                                    message: "Stats Updated Succesfully",
                                                    firstName: responsefirstt.firstName,
                                                    lastName: responsefirstt.lastName,

                                                    email: responsefirstt.email,
                                                    healingTime: responsefirstt.healingTime,
                                                    healingDays: responsefirstt.healingDays,
                                                    currentStreak: responsefirstt.currentStreak,
                                                    profileImage: responsefirstt.profileImage,
                                                    dailyReminder: responsefirstt.dailyReminder,
                                                    isPasswordSet: responsefirstt.isPasswordSet,
                                                    // subscriptionDetail: purchase.iosReceiptDetails || {}

                                                }
                                            )

                                        }
                                        else {
                                            response.status(200).send(
                                                {

                                                    message: "Stats Updated Succesfully",
                                                    firstName: responsefirstt.firstName,
                                                    lastName: responsefirstt.lastName,

                                                    email: responsefirstt.email,
                                                    healingTime: responsefirstt.healingTime,
                                                    healingDays: responsefirstt.healingDays,
                                                    currentStreak: responsefirstt.currentStreak,
                                                    profileImage: responsefirstt.profileImage,
                                                    dailyReminder: responsefirstt.dailyReminder,
                                                    isPasswordSet: responsefirstt.isPasswordSet,
                                                    // subscriptionDetail: {}

                                                }
                                            )


                                        }



                                    }

                                })


                            }
                        }
                        
                        // }

                    })
                }
            })
        }

    },


    setPassword(req, response) {
        let passwordDetails = req.body
        if ((req.body.newPassword).length < 7) {
            return response.status(400).send({
                success: false,
                message: "Password should be longer"
            });

        }
        else {


            models.users.findOne({ _id: req.user._id }, (err, user) => {
                // console.log("user", user.email)
                if (!user) {
                    return response.status(400).send({
                        success: false,
                        message: "Not A Valid User"
                    });

                }
                else if (!user.email) {
                    return response.status(400).send({
                        success: false,
                        message: "You Are required to Set You email first"
                    });

                }
                else if (user.isVerified == false) {
                    return response.status(400).send({
                        success: false,
                        message: "Your Email is not verified Cannot Set Password"
                    });

                }
                else {

                    if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
                        user.password = passwordDetails.newPassword;

                        user.save(function (err) {
                            if (err) {
                                return response.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                models.users.findOneAndUpdate({ _id: user._id }, { isPasswordSet: true }, { new: true }, (err, res) => {
                                    var token = jwt.sign({
                                        data: user
                                    }, config.secret, {
                                        expiresIn: config.sessionExpire // in seconds
                                    });

                                    response.status(200).json({
                                        success: true,
                                        message: 'Password Set Successfully!!',
                                        token: token,
                                        isPasswordSet: res.isPasswordSet,
                                        statusCode: 200
                                    });

                                })

                            }
                        });
                    }
                }
            })
        }
    },


};

module.exports = crud;
