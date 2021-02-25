'use strict';

var mongoose = require('../models/db.server.connect'),
	errorHandler = require('./errors.server.controller');

module.exports = function(modelName) {

    var Model = mongoose.model(modelName);

    return {

        // Create operations	
        create: function(req, response) {
            Model.create(req.body, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(201).json(res);
				}
            })
        },

        // Find operations
        list: function(req, response) {
        	var query = req.body.query || {} ,	
        		projection = req.query || {} ;
        	Model.find(query, projection, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

        getById: function(req, response) {
        	var id = req.params.id,
        		projection = req.query || {} ;

        	Model.findById(id, projection, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })	
        },

        findOne: function(req, response) {
        	var query = req.params.query,
        		projection = req.query || {} ;

        	Model.findOne(query, projection, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

        //Update operations
        update: function(req, response) {

        	var query = req.body.query, 
        		update = req.body.update,
        		options = req.body.options || {};

        	Model.update(query, update, options).exec(function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

        findOneAndUpdate: function(req, response) {
        	var query = req.body.query,
        		update = req.body.update,
        		options = req.body.options || {};

        	Model.findOneAndUpdate(query, update, options).exec(function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

        findByIdAndUpdate: function(req, response) {
        	var id = req.params.id,
        		update = req.body.update,
        		options = req.body.options || {};
        	Model.findByIdAndUpdate(id, update, options).exec(function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

        //Delete operations
        delete: function(req, response) {
        	var query = req.body.query ;
        	
        	Model.remove(query, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

        findOneAndRemove: function(req, response) {
        	var query = req.body.query ;

        	Model.findOneAndRemove(query, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

        findByIdAndRemove: function(req, response) {
        	var id = req.params.id,
        		options = req.body.options ;

        	Model.findByIdAndRemove(id, options, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					response.status(200).json(res);
				}
            })
        },

		removeByDocument: function(req, response) {
			var id = req.params.id;

			Model.findOneAndRemove({_id: id}, function(err, res) {
                if (err) {
                	console.log("err",err)
					response.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.remove();
					response.status(200).json(res);
				}
            })
		}
    }
}
