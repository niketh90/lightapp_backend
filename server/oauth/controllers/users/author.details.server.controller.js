'use strict';
let _ = require('lodash'),
    config = require('../../../config.server'),
    models = require('../../models'),
    async = require('async'),
    errorHandler = require('./../errors.server.controller');
    multer = require('multer'),
	path = require('path'),
	Storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, path.join(process.env.PWD, 'uploads'));
		},
		filename: function (req, file, callback) {
            // console.log("File", file)

			callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
		}
	}),
	upload = multer({
		storage: Storage
	}),
	documentImage = upload.single('videoUrl')

    let moreFunctions = {
        getAllAuthors: (req, response) => {
            let params = req.query;
            
            models.authors
                .find({isDeleted: false})
                .exec((err, results) => {                    
                    if (err) {
                        // console.log("err", err)
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        results = JSON.parse(JSON.stringify(results))
                        response.status(200).send({
                            success: true,
                            data: results
                        })
                    }
                })
        },

        deleteAuthor: (req, response) => {    
            let id = req.params.id;
            models.authors.findByIdAndUpdate(id,{$set:{isDeleted:true}},{new:true},(err,res)=>{
                if(err) {
                    response.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    response.status(200).send({
                        success: true,
                        // data: res
                    })
                }
            })
        },
          
        getAuthor: (req, response) => {    
            let id = req.params.id;
            models.authors.find({_id:id},(err,res)=>{
                if(err) {
                    response.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    response.status(200).send({
                        success: true,
                        data: res
                    })
                }
            })
        },
        editAuthor: (req, response) => {    
            let id = req.params.id;
            let body  = req.body;
            models.authors.findByIdAndUpdate({_id:id}, body,{new:true},(err,res)=>{
                if(err) {
                    response.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    response.status(200).send({
                        success: true,
                        data: res
                    })
                }
            })
        },
 

        addAuthor: (req,res) => {
            let body = req.body;
                models.authors.create(body, function (err, results) {
                if (err) {
                    // console.log("err", err)
                    res.status(400).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.status(200).send({
                        success: true,
                        message:"Author Added",
                        data: results
                    })
                }
            })                
},
}
    
    module.exports = _.merge(
        moreFunctions
    );
    