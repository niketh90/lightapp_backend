'use strict';
let _ = require('lodash'),
    models = require('../../models'),
    errorHandler = require('../errors.server.controller');

    let moreFunctions = {
        getAllCategories: (req, response) => {
            let params = req.query;
            
            models.category
                .find({isDeleted:false})
                .exec((err, results) => {                    
                    if (err) {
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        results = _.orderBy(results, ['created_at'], ['desc'])                       
                        response.status(200).send({
                            success: true,
                            data: results
                        })
                    }
                })
        },
       
     
        deleteCategory: (req, response) => {    
            let id = req.params.id;
            models.category.findByIdAndUpdate(id,{$set:{isDeleted:true}},{new:true},(err,res)=>{
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
        
        getCategory: (req, response) => {    
            let id = req.params.id;
            models.category.find({_id:id},(err,res)=>{
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
        editCategory: (req, response) => {    
            let id = req.params.id;
            let body  = req.body;
            models.category.findByIdAndUpdate({_id:id}, body,{new:true},(err,res)=>{
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
 
        addNewCategory: (req, response) => {
            let body  = req.body;         
            models.category.create(body,(err,res)=>{
                if(err) {
                    response.status(500).send({
                        success: false,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    models.authors.findOne({_id: res.sessionAuthor}).populate([{
                        path: 'sessionCategory',
                        model: 'category',
                        select: ['categoryName']
                    }])
                    .exec((err, result) => {
                        if (err) {
                            response.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            
                            response.status(200).json(res);
                        }
                    })
                }
            })
        }   
    }
    
    module.exports = _.merge(
        moreFunctions
    );
    