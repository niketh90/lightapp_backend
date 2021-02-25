'use strict';
let _ = require('lodash'),
    config = require('../../../config.server'),
    models = require('../../models'),
    async = require('async'),
    path = require('path'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    ffmpeg = require('fluent-ffmpeg'),
    errorHandler = require('./../errors.server.controller');
multer = require("multer"),
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
    documentImage = uploadAllTypeOfFiles.single('videoUrl')


let moreFunctions = {

    getAllSessions: async (req, response) => {
        let params = req.query
        // Date.prototype.UTCfloor = function () {
        //     return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()));
        // };
        // let dd = new Date().UTCfloor();
        try {

            if (!req.body.sessionDate) {
                response.status(400).send({
                    success: false,
                    message: "Date is required"
                });
            } else {
                let streak = await models.users.findOne({ _id: req.user._id });
                let newStreak
                let updatedStreak 
                let d = new Date(req.body.sessionDate);
                if (d.toString()===streak.lastPlayed.toString()) {
                    newStreak = await models.users.findOneAndUpdate({ _id: streak._id }, { $set: { currentStreak:streak.currentStreak} }, { new: true })
                } else {
                    let here = d - streak.lastPlayed
                    let diff = here/86400000;
                    console.log("Last played", streak.lastPlayed)
                    console.log("Current Date", d)
                    console.log("Diff", diff)
                    console.log("Diff", here)
                    if(diff>1) {
                        console.log("11111")
                        updatedStreak = await models.users.findOneAndUpdate({_id:streak._id},{$set:{currentStreak:0}},{new:true});
                        console.log("updatedStreak", updatedStreak)
                    } else {
                        console.log("22222")
                        newStreak = await models.users.findOneAndUpdate({ _id: streak._id }, { $set: { currentStreak:streak.currentStreak} }, { new: true })
                    }
                }
                console.log("Date ,here",req.body.sessionDate);
                let userUpdatedInformation = await models.users.findOne({ _id: req.user._id });
            
                let aggregate = [
                    {
                        $lookup: {
                            from: 'authors',
                            as: 'sessionAuthor',
                            let: {
                                sessionAuthor: '$sessionAuthor'
                            },
                            pipeline: [
                                {
                                    "$match": { "$expr": { "$eq": ["$_id", "$$sessionAuthor"] } }
                                },
                                {
                                    $project: {
                                        "authorName": 1,
                                        "authorImage": 1,
                                        "authorWebsite": 1
                                    }
                                }
                            ],
    
                        }
                    },
                    {
                        $unwind: ("$sessionAuthor")
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            as: 'sessionCategory',
                            let: {
                                sessionCategory: '$sessionCategory'
                            },
                            pipeline: [
                                {
                                    "$match": { $and: [{ "isDeleted": { $eq: false }, "$expr": { "$eq": ["$_id", "$$sessionCategory"] } }] },
                                },
                                {
                                    $project: {
                                        "categoryName": 1,
                                        "created_at": 1,
                                        "indexNumber": 1
                                    }
                                },
                            ],
                        }
                    },
                    {
                        $unwind: ("$sessionCategory")
                    },
                    {
                        $group: {
                            _id: '$sessionCategory.categoryName',
                            indexNumber: { $last: '$sessionCategory.indexNumber' },
                            sessions:
                            {
                                $push: '$$ROOT'
                            }
                        },
                    },
                    // {
                    //     $sort: { "_id": -1 },
                    // },
                    {
                        $sort: { "indexNumber": 1 },
                    },
                    {
                        $project: {
                            categoryName: '$_id',
                            // indexNumber: 1,
                            sessions: 1,
                            _id: 0,
                            // sessions: {
                            //     $filter: {
                            //         input: "$sessions",
                            //         as: "sessions",
                            //         cond: { '$lte': ["$$sessions.sessionDate", dd] }
                            //     }
                            // }
                        }
                    }
                ]
                models.sessions.aggregate(aggregate).exec((err, results) => {
                    // let arr = []
                    // arr  = arr.push(results)
                    // console.log(arr)
    
                    // results = results.filter((res) => res.sessions.length !== 0);
    
                    if (err) {
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    else {
    
                        let filter = {
                            sessionDate: { $eq: moment(req.body.sessionDate).format("YYYY-MM-DD"), }
                        }
                        models.sessions
                            .find(filter).populate([{
                                path: ('sessionCategory'),
                                model: ('category'),
                                select: [('categoryName'), ('created_at')]
                            }, {
                                path: ('sessionAuthor'),
                                model: ('author'),
                                select: [('authorName'), ('authorImage'), ('authorWebsite')]
                            }
                            ]).limit(parseInt(params.length))
                            .skip(parseInt(params.start))
                            .exec((err, result) => {
                                if (err) {
                                    response.status(400).send({
                                        success: false,
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                }
                                else {
                                    if (result.length === 0) {
                                        let filter1 = {
                                            sessionDate: { $lt: moment(req.body.sessionDate).format("YYYY-MM-DD"), }
                                        }
                                        console.log(filter1)
                                        models.sessions
                                            .find(filter1).populate([{
                                                path: ('sessionCategory'),
                                                model: ('category'),
                                                select: [('categoryName'), ('created_at')]
                                            }, {
                                                path: ('sessionAuthor'),
                                                model: ('author'),
                                                select: [('authorName'), ('authorImage'), ('authorWebsite')]
                                            }
                                            ]).limit(parseInt(params.length))
                                            .skip(parseInt(params.start))
                                            .exec((err, resold) => {
                                                if (err) {
                                                    response.status(400).send({
                                                        success: false,
                                                        message: errorHandler.getErrorMessage(err)
                                                    });
                                                }
                                                else if (!resold) {
                                                    response.status(400).send({
                                                        success: false,
                                                        message: "No Sessions found"
                                                    });
                                                }
                                                else {
                                                    resold = _.orderBy(resold, ['sessionDate'], ['desc'])
                                                    let id = resold[0]._id
    
                                                    results.forEach(function (o) {
                                                        o.sessions = o.sessions.filter(s =>
                                                            s._id.toString() !== id.toString())
                
                                                    });
                                                    results = results.filter((res) => res.sessions.length !== 0);
                
                                                   
                                                    response.status(200).send({
                                                        statusCode: 200,
                                                        success: true,
                                                        dailySession: resold[0] || {},
                                                        categories: results,
                                                        user:{
                                                            currentStreak: userUpdatedInformation.currentStreak,
                                                            healingTime: userUpdatedInformation.healingTime,
                                                            healingDays: userUpdatedInformation.healingDays,
                                                        }
                                                    })
                                                }
                                            })
                                    }
                                    else {
                                        let id = result[0]._id
    
                                        results.forEach(function (o) {
                                            o.sessions = o.sessions.filter(s =>
                                                s._id.toString() !== id.toString())
    
                                        });
                                        results = results.filter((res) => res.sessions.length !== 0);
    
                                        result = _.orderBy(result, ['created_at'], ['desc'])
                                        response.status(200).send({
                                            success: true,
                                            dailySession: result[0] || {},
                                            categories: results,
                                            statusCode: 200,
                                            user:{
                                                currentStreak: userUpdatedInformation.currentStreak,
                                                healingTime: userUpdatedInformation.healingTime,
                                                healingDays: userUpdatedInformation.healingDays,
                                            }
                                        })
                                    }
                                }
                            })
                    }
                })
            }
        } catch(error) {
            response.status(500).send({
                success: false,
                message: errorHandler.getErrorMessage(error),
            })
        }
    },

    getSessions: (req, response) => {
        if (!req.body.length && !req.body.index) {
            response.status(400).send({
                success: false,
                message: "Length and index Required"
            });

        }
        else {
            Date.prototype.UTCfloor = function () {
                return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()));
            };
            let dd = new Date().UTCfloor();

            let text = req.body.text
            let aggregation = [
                {
                    $lookup: {
                        from: 'authors',
                        as: 'sessionAuthor',
                        let: {
                            sessionAuthor: '$sessionAuthor'
                        },
                        pipeline: [
                            {
                                "$match": { "$expr": { "$eq": ["$_id", "$$sessionAuthor"] } }
                            },
                            {
                                $project: {
                                    "authorName": 1,
                                    "authorImage": 1,
                                    "authorWebsite": 1
                                }
                            }
                        ],

                    }

                },
                {
                    $unwind: ("$sessionAuthor")
                },

                {
                    $lookup: {
                        from: 'categories',
                        as: 'sessionCategory',
                        let: {
                            sessionCategory: '$sessionCategory'
                        },
                        pipeline: [
                            {
                                "$match": { $and: [{ "isDeleted": { $eq: false }, "$expr": { "$eq": ["$_id", "$$sessionCategory"] } }] }
                            },
                            {
                                $project: {
                                    "categoryName": 1,
                                }
                            },

                        ],
                    }
                },

                {
                    $unwind: ("$sessionCategory")
                },

                {
                    $match: {
                        $or: [{
                            "sessionName": {
                                $regex: new RegExp(text, 'i')
                            }
                        },
                        {
                            "sessionAuthor.authorName": {
                                $regex: new RegExp(text, 'i')
                            }

                        },
                        {
                            "sessionCategory.categoryName": {
                                $regex: new RegExp(text, 'i')
                            }

                        },
                        {
                            'sessionDescription': {
                                $regex: new RegExp(text, 'i')
                            }
                        }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "$sessions",
                        sessions: {
                            $push: '$$ROOT'
                        }
                    },
                },
                {
                    $project: {
                        _id: 0,
                        sessions: 1,
                        // sessions: {
                        //     $filter: {
                        //         input: "$sessions",
                        //         as: "sessions",
                        //         cond: { '$lte': ["$$sessions.sessionDate", dd] }
                        //     },
                        // },

                    },
                },
                {
                    $unwind: "$sessions"
                },
                { "$limit": parseInt(req.body.length) },
                { "$skip": parseInt(req.body.index) },

            ]
            models.sessions
                .aggregate(aggregation).exec((err, results) => {

                    let arr = []
                    for (let index = 0; index < results.length; index++) {
                        // console.log(results[index].sessions)
                        arr.push(results[index].sessions)
                    }
                    if (err) {
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });

                    }
                    else {
                        let count = arr.length
                        models.sessions.count({}, (err, ress) => {
                            // console.log(ress)
                            if (err) {

                                response.status(400).send({
                                    success: false,
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                            else if (results.length === 0) {
                                response.status(200).send({
                                    success: true,
                                    data: [],
                                    pagination: {
                                        totalSessions: ress,
                                        currentSessions: 0,
                                        index: req.body.index
                                    }
                                })
                            }
                            else {

                                response.status(200).send({
                                    success: true,
                                    data: arr,
                                    // data: (results && results.sessions) || [],
                                    pagination: {
                                        totalSessions: ress,
                                        currentSessions: count,
                                        index: req.body.index
                                    }
                                })
                            }
                        })
                    }
                })
        }
        // let params = req.body;
        // let filter = {};
        // if (params.text) {
        //     var regx = new RegExp(params.text, 'i');
        //     if (params.text.length > 0) {
        //         filter['$or'] = [{
        //             sessionName: regx,
        //         },
        //         {
        //             sessionDescription: regx
        //         },
        //         ]
        //     }
        // }
        // models.sessions
        //     .find(filter).populate([{
        //         path: ('sessionCategory'),
        //         model: ('category'),
        //         select: ('categoryName')
        //     }, {
        //         path: ('sessionAuthor'),
        //         model: ('author'),
        //         select: [('authorName'), ('authorImage'), ('authorWebsite')]
        //     },           
        // ])
        //     // .find(filter)
        //     .limit(parseInt(params.length))
        //     .skip(parseInt(params.length * params.index))
        //     // .find(filter)
        //     .exec((err, results) => {
        //         let length = results.length
        //         console.log("err", err)
        //         if (err) {
        //             // console.log("err", err)
        //             response.status(400).send({
        //                 success: false,
        //                 message: errorHandler.getErrorMessage(err)
        //             });
        //         } else {
        //             models.sessions.count({}, (err, ress) => {
        //                 // console.log(ress)
        //                 if (err) {

        //                     response.status(400).send({
        //                         success: false,
        //                         message: errorHandler.getErrorMessage(err)
        //                     });
        //                 }
        //                 else {
        //                     results = JSON.parse(JSON.stringify(results))
        //                     response.status(200).send({
        //                         success: true,
        //                         data: results,
        //                         pagination: {
        //                             totalSessions: ress,
        //                             currentSessions: length,
        //                             index: params.index
        //                         }
        //                     })

        //                 }

        //             })
        //         }
        //     })
    },

    //Sessions For Admin
    getSessionsAdmin: (req, response) => {
        let params = req.query;
        models.sessions
            .aggregate([
                {
                    $lookup: {
                        from: 'authors',
                        as: 'sessionAuthor',
                        let: {
                            sessionAuthor: '$sessionAuthor'
                        },
                        pipeline: [
                            {
                                "$match": { "$expr": { "$eq": ["$_id", "$$sessionAuthor"] } }
                            },
                            {
                                $project: {
                                    "authorName": 1,
                                    "authorImage": 1,
                                    "authorWebsite": 1
                                }
                            }
                        ],

                    }

                },
                {
                    $unwind: ("$sessionAuthor")
                },

                {
                    $lookup: {
                        from: 'categories',
                        as: 'sessionCategory',
                        let: {
                            sessionCategory: '$sessionCategory'
                        },
                        pipeline: [
                            {
                                "$match": { $and: [{ "isDeleted": { $eq: false }, "$expr": { "$eq": ["$_id", "$$sessionCategory"] } }] }
                            },
                            {
                                $project: {
                                    "categoryName": 1,
                                }
                            },

                        ],
                    }
                },
                {
                    $unwind: ("$sessionCategory")
                },
            ]).exec((err, results) => {
                // console.log(err)
                if (err) {
                    response.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    results = _.orderBy(results, ['created_at'], ['desc'])
                    results = JSON.parse(JSON.stringify(results))
                    response.status(200).send({
                        success: true,
                        data: results,
                        statusCode: 200
                    })
                }
            })
    },


    deleteSession: (req, response) => {
        let id = req.params.id;
        models.sessions.findByIdAndDelete(id, (err, res) => {
            if (err) {
                response.status(400).send({
                    success: false,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                models.sessionstats.deleteMany({sessionId: req.params.id},(err,res)=>{
                    if(err)
                    {
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });

                    }
                    else
                    {
                        response.status(200).send({
                            success: true,
                            message: "Deleted Successfully"
                        })

                    }

                })
             
            }
        })
    },
    editSession: (req, response) => {
        let id = req.params.id;
        let body = req.body;
        let filter = {
            sessionDate: { $eq: moment(body.sessionDate, "YYYY-MM-DD").format("YYYY-MM-DD"), }
        }
        // console.log(body.sessionDate)
        models.sessions.findOne((filter), (err, ress) => {
            // console.log(ress)
            if (err) {
                response.status(500).send({
                    success: false,
                    message: errorHandler.getErrorMessage(err)
                });

            }
            else if (ress) {
                let results = JSON.parse(JSON.stringify(ress._id))
                // console.log(ress)
                if (results === id) {
                    models.sessions.findByIdAndUpdate({ _id: id }, body, { new: true }, (err, res) => {
                        if (err) {
                            response.status(400).send({
                                success: false,
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {

                            let fileName = res.sessionUrl
                            let extension = path.extname(fileName)
                            // console.log(extension)

                            if (extension == '.mp3' || extension == '.wav' || extension == '.ogg' || extension == ".m4a" || extension == ".mpeg") {
                                models.sessions.findByIdAndUpdate({ _id: res._id },
                                    { $set: { sessionType: 2 } }, { new: true }, (err, resfinal) => {
                                        // console.log(resfinal)
                                        if (err) {
                                            response.status(500).send({
                                                success: false,
                                                message: errorHandler.getErrorMessage(err)
                                            });
                                        }
                                        else {
                                            response.status(200).send(
                                                {
                                                    success: true,
                                                    data: resfinal
                                                });
                                        }
                                    })
                            }
                            else {
                                models.sessions.findByIdAndUpdate({ _id: res._id },
                                    { $set: { sessionType: 1 } }, { new: true }, (err, resfinal) => {
                                        // console.log(resfinal)
                                        if (err) {
                                            response.status(500).send({
                                                success: false,
                                                message: errorHandler.getErrorMessage(err)
                                            });
                                        }
                                        else {
                                            response.status(200).send(
                                                {
                                                    success: true,
                                                    data: resfinal
                                                });
                                        }
                                    })

                            }
                        }
                    })
                }

                else {
                    response.status(500).send({
                        success: false,
                        message: "THIS DATE IS ALREADY RESERVED FOR A PREVIOUS DAILY SESSION"
                    });

                }
            }
            else {
                models.sessions.findByIdAndUpdate({ _id: id }, body, { new: true }, (err, res) => {
                    if (err) {
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {

                        let fileName = res.sessionUrl
                        let extension = path.extname(fileName)
                        // console.log(extension)

                        if (extension == '.mp3' || extension == '.wav' || extension == '.ogg' || extension == ".m4a" || extension == ".mpeg") {
                            models.sessions.findByIdAndUpdate({ _id: res._id },
                                { $set: { sessionType: 2 } }, { new: true }, (err, resfinal) => {
                                    // console.log(resfinal)
                                    if (err) {
                                        response.status(500).send({
                                            success: false,
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    }
                                    else {
                                        response.status(200).send(
                                            {
                                                success: true,
                                                data: resfinal
                                            });
                                    }
                                })
                        }
                        else {
                            models.sessions.findByIdAndUpdate({ _id: res._id },
                                { $set: { sessionType: 1 } }, { new: true }, (err, resfinal) => {
                                    // console.log(resfinal)
                                    if (err) {
                                        response.status(500).send({
                                            success: false,
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    }
                                    else {
                                        response.status(200).send(
                                            {
                                                success: true,
                                                data: resfinal
                                            });
                                    }
                                })

                        }
                    }
                })

            }
        })
    },

    addNewSession: (req, response) => {
        let body = req.body;
        body.sessionCategory = mongoose.Types.ObjectId(body.sessionCategory);
        body.sessionAuthor = mongoose.Types.ObjectId(body.sessionAuthor);

        let filter = {
            sessionDate: { $eq: moment(req.body.sessionDate).format("YYYY-MM-DD"), }
        }
        models.sessions.findOne((filter), (err, res) => {
            if (err) {
                response.status(500).send({
                    success: false,
                    message: errorHandler.getErrorMessage(err)
                });

            }
            else if (res) {
                response.status(500).send({
                    success: false,
                    message: "THIS DATE IS ALREADY RESERVED FOR A PREVIOUS DAILY SESSION"
                });
            }
            else {
                models.sessions.create(body, async (err, res) => {
                    if (err) {
                        response.status(500).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        // let dd = res.sessionDate
                        // dd = dd.toUTCString()
                        // console.log(dd)
                        let fileName = res.sessionUrl
                        let extension = path.extname(fileName)

                        if (extension == '.mp3' || extension == '.wav' || extension == '.ogg' || extension == ".m4a" || extension == ".mpeg") {
                            models.sessions.findByIdAndUpdate({ _id: res._id },
                                { $set: { sessionType: 2 } }, { new: true }, (err, resfinal) => {
                                    // console.log(resfinal)
                                    if (err) {
                                        response.status(500).send({
                                            success: false,
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    }
                                    else {
                                        response.status(200).send(
                                            {
                                                success: true,
                                                data: resfinal
                                            });

                                    }
                                })
                        }
                        else {
                            response.status(200).send({
                                success: true,
                                data: res
                            });

                        }
                    }
                })
            }
        })
    },

    // Get a Single session
    getOneSession: (req, response) => {
        let sessionId = req.params.id
        models.sessions.findOne({ _id: sessionId }, (err, res) => {
            if (err) {
                response.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else if (!res) {
                response.status(400).send({
                    success: false,
                    message: "Not A Valid Session"
                });
            }
            else {
                models.authors.findOne({ _id: res.sessionAuthor }, (err, restwo) => {
                    if (err) {
                        response.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    else if (!res) {
                        response.status(400).send({
                            success: false,
                            message: "Author Not Found"
                        });

                    }
                    else {
                        let authorName = restwo.authorName
                        let authorImage = restwo.authorImage

                        models.category.findOne({ _id: res.sessionCategory }, (err, resthree) => {
                            if (err) {
                                response.status(400).send({
                                    success: false,
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                            else if (!resthree) {
                                response.status(400).send({
                                    success: false,
                                    message: "Category Not Found"
                                });
                            }
                            else {
                                let categoryName = resthree.categoryName
                                response.status(200).send({
                                    _id: res._id,
                                    sessionName: res.sessionName,
                                    sessionType: res.sessionType,
                                    sessionThumbNail: res.sessionThumbNail,
                                    sessionUrl: res.sessionUrl,
                                    sessionTime: res.sessionTime,
                                    sessionDescription: res.sessionDescription,
                                    sessionAuthor: authorName,
                                    authorImage: authorImage,
                                    sessionCategory: categoryName,

                                })

                            }

                        })
                    }

                })
            }

        })

    },


    //Get session for WEb
    getOneSessionForWeb: (req, response) => {
        let sessionId = req.params.id;

        models.sessions.findOne({ _id: sessionId }, (err, res) => {
            if (err) {
                response.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else if (!res) {
                response.status(400).send({
                    success: false,
                    message: "Not A Valid Session"
                });
            }
            else {
                response.status(200).send({
                    _id: res._id,
                    sessionName: res.sessionName,
                    sessionType: res.sessionType,
                    sessionThumbNail: res.sessionThumbNail,
                    sessionUrl: res.sessionUrl,
                    sessionTime: res.sessionTime,
                    sessionDescription: res.sessionDescription,
                    sessionAuthor: res.sessionAuthor,
                    sessionCategory: res.sessionCategory,
                    ratingMessage: res.ratingMessage,
                    sessionDate: res.sessionDate

                })
            }

        })
    },


    uploadVideo: (req, response) => {
        if(!req.files[0])
        {
            return response.status(400).send({
                success: false,
                message: 'Choose a file.'
            })

        }
        else
        {

        documentImage(req, response, (err) => {
            let tm = Date.now();
            let thumbnailUrl = "";
            if (req.files[0].mimetype.match('video.*.,audio.*')) {
                let pathOfVideo = path.join(process.env.PWD, 'uploads');
                var proc = new ffmpeg(path.join(process.env.PWD, 'uploads' + '/' + req.files[0].filename))

                thumbnailUrl = config.serverUrl + req.files[0].filename + "_" + tm + ".png"
            }

            if (err) {
                // console.log(err);
                return response.status(400).send({ success: false, message: 'uploading failed.' });
            }
            if (req.files) {
                response.status(200).send({
                    success: true,
                    videoOrPhotoUrl: config.serverUrl + req.files[0].filename,
                    thumbnailUrl: thumbnailUrl
                })
            } else {

                return response.status(400).send({
                    success: false,
                    message: 'uploading failed.'
                })
            }
        })
    }
    },




    uploadThumbNail: (req, response) => {
        if(!req.files[0])
        {
            return response.status(400).send({
                success: false,
                message: 'Choose one file atleast.'
            })
        }
        else
        {

        documentImage(req, response, (err) => {

            let tm = Date.now();
            let thumbnailUrl = "";
            if (req.files[0].mimetype.match('image.*')) 
            {
                let pathOfVideo = path.join(process.env.PWD, 'uploads');
                var proc = new ffmpeg(path.join(process.env.PWD, 'uploads' + '/' + req.files[0].filename))

                thumbnailUrl = config.serverUrl + req.files[0].filename
            }

            if (err) {
                console.log(err);
                return response.status(400).send({ success: false, message: 'uploading failed.' });
            }
            if (req.files) {
                response.status(200).send({
                    success: true,
                    photoUrl: config.serverUrl + req.files[0].filename,
                    thumbnailUrl: thumbnailUrl
                })
            } else {

                return response.status(400).send({
                    success: false,
                    message: 'uploading failed.'
                })
            }
        })
    }
    },




    //Session Statastics
    getSessionStats: async (req, res) => {
        try {
            let sessionId = req.params.sessionId;

            if (!sessionId) {
                return res.status(400).send({
                    success: false,
                    message: "Seesion Id is required"
                })
            } else {
                let sessionInfo = await models.sessions
                    .findOne({ _id: sessionId })
                if (!sessionInfo) {
                    return res.status(400).send({
                        success: false,
                        message: "Session not found."
                    })
                }
                let sessionratingArray = await models.ratings
                    .find({ sessionId })
                    .populate({
                        path: 'userId',
                        select: ['firstName', 'lastName', 'email']
                    });
                let avrageRating = await models.ratings
                    .aggregate([
                        {
                            $match: { sessionId: mongoose.Types.ObjectId(sessionId) }
                        },
                        {
                            $group:
                            {
                                _id: null,
                                rating: { $avg: "$rating" }
                            }
                        }
                    ])

                return res.status(200).send({
                    success: true,
                    ratingsArray: sessionratingArray,
                    sessionInfo: sessionInfo,
                    avgRating: (avrageRating && avrageRating[0] && avrageRating[0].rating) || 0
                })
            }

        } catch (err) {
            return res.status(500).send({
                success: false,
                message: err.message || "Something went wrong"
            })
        }
    },
    sessionWiseStats: async (req, res) => {
        try {
            let sessionId = req.params.sessionId;
            // let startDate = req.body.startDate,
            // // + "T00:00:00Z",
            // endDate = req.body.endDate
            // //  + "T23:59:59Z"; 
              let startDate = moment(req.body.startDate).format("YYYY-MM-DD") + "T00:00:00.000Z"
            let endDate = moment(req.body.endDate).format("YYYY-MM-DD") + "T23:59:59.000Z"
            // let startDate = req.body.startDate + "T00:00:00Z",
            // endDate = req.body.endDate + "T23:59:59Z";
            if (!sessionId) {
                return res.status(400).send({
                    success: false,
                    message: "Session Id is required"
                })
            }
     
            else if(!req.body.startDate || !req.body.endDate)
          {
            return res.status(400).send({
                success: false,
                message: "Dates Are required"
            })
          }
       
            else {
                let sessionInfo = await models.sessions
                    .findOne({ _id: sessionId })
                if (!sessionInfo) {
                    return res.status(400).send({
                        success: false,
                        message: "Session not found."
                    })
                }

                // console.log(startDate, endDate)
                let userArray = await models.sessionstats
                    .find({ $and: [{ created_at: { $gt: (startDate), $lt: (endDate) } }, { sessionId: sessionId }] })
                    .populate([{
                        path: 'userId',
                        model: ('User'),
                        select: ['firstName', 'lastName', 'email']
                    }, {
                        path: 'sessionId',
                        model: ('session'),
                        select: ['sessionName']

                    }, {
                        path: 'authorId',
                        model: ('author'),
                        select: ['authorName']

                    }]
                    );
                if (userArray.length === 0) {
                    return res.status(500).send({
                        success: false,
                        message: "This session is not played by any user yet"
                    })
                }
                let totalCount = await models.sessionstats.find({ created_at: { $gt: (startDate), $lt: (endDate) }})
                // console.log(totalCount.length)

                // let userArray = await models.sessionstats
                //     .find({$and:[{filter},{ sessionId: sessionId }]})
                //     .populate({
                //         path: 'userId',
                //         model: ('User'),
                //         select: ['firstName', 'lastName', 'email']
                //     });

                return res.status(200).send({
                    success: true,
                    users: userArray,
                    sessionInfo: sessionInfo,
                    totalCount: (userArray.length) || 0,
                    totalSessionsPlayed: totalCount.length || 0

                })
            }

        } catch (err) {
            return res.status(500).send({
                success: false,
                message: err.message || "Something went wrong"
            })
        }
    },
    authorWiseStats: async (req, res) => {
        try {
            let authorId = req.params.authorId;

            let startDate = moment(req.body.startDate).format("YYYY-MM-DD") + "T00:00:00.000Z"
            let endDate = moment(req.body.endDate).format("YYYY-MM-DD") + "T23:59:59.000Z"
            if (!authorId) {
                return res.status(400).send({
                    success: false,
                    message: "Session Id is required"
                })
            }
            else if(!req.body.startDate || !req.body.endDate)
            {
              return res.status(400).send({
                  success: false,
                  message: "Dates Are required"
              })
            }
         
            else {
                let authorInfo = await models.authors
                    .findOne({ _id: authorId })
                if (!authorInfo) {
                    return res.status(400).send({
                        success: false,
                        message: "Session not found."
                    })
                }

                // console.log(startDate, endDate)
                let userArray = await models.sessionstats
                    .find({ $and: [{ created_at: { $gt: (startDate), $lt: (endDate) } }, { authorId: authorId }] })
                    .populate(
                        [{
                            path: 'userId',
                            model: ('User'),
                            select: ['firstName', 'lastName', 'email']
                        }, {
                            path: 'sessionId',
                            model: ('session'),
                            select: ['sessionName']

                        }, {
                            path: 'authorId',
                            model: ('author'),
                            select: ['authorName']

                        }]
                    );
                if (userArray.length === 0) {
                    return res.status(500).send({
                        success: false,
                        message: "No session is played for this author"
                    })
                }
                let totalCount = await models.sessionstats.find({ created_at: { $gt: (startDate), $lt: (endDate) }})
                // let userArray = await models.sessionstats
                //     .find({$and:[{filter},{ sessionId: sessionId }]})
                //     .populate({
                //         path: 'userId',
                //         model: ('User'),
                //         select: ['firstName', 'lastName', 'email']
                //     });

                return res.status(200).send({
                    success: true,
                    users: userArray,
                    authorInfo: authorInfo,
                    totalCount: (userArray.length) || 0,
                    totalSessionsPlayed:totalCount.length || 0
                })
            }

        } catch (err) {
            return res.status(500).send({
                success: false,
                message: err.message || "Something went wrong"
            })
        }
    },
}


module.exports = _.merge(
    moreFunctions
);
//  $lookup: {
//                 from: 'authors',
//                 localField: 'sessionAuthor',
//                 foreignField: '_id',
//                 as: 'sessionAuthor'
//             },
//  $project:{
// categoryName: '$_id',
//             sessions: 1,
//            authorName:1,
//             _id: 0,"sessionAuthor.authorName":1,
// "sessionAuhtor.authorImage":1



