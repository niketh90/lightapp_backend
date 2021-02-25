'use strict';
let _ = require('lodash'),
    config = require('../../../config.server'),
    models = require('../../models'),
    async = require('async'),
    errorHandler = require('./../errors.server.controller');

  
    let moreFunctions = {
        
        rateSession:(req, response)=>{
                let sessionId = req.body.sessionId
                let body  = req.body; 
                let filter ={}
                filter['$and'] = [{
                    userId:req.user._id 
                },
                {
                    sessionId: sessionId
                }
            ]
                
                models.ratings.findOne(filter,(err,resp)=>{
                    if(err)
                    {
                        response.status(400).send({
                            success: false,
                            message: errorHandler.getErrorMessage(err)
                        });

                    }
                    else if(resp)
                    {
                        models.ratings.findOneAndUpdate({_id:resp._id},{$set:{rating: body.rating}},(err,res)=>{
                            if(err)
                            {
                                response.status(400).send({
                                    success: false,
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                            if(!res)
                            {
                                response.status(400).send({
                                    success: false,
                                    message: "Cannot Save Rating"
                                });

                            }
                            else{
                                response.status(200).send({
                                    success: true,
                                    message:"Rating Updated"
                                })
                            }
                        })

                    }
                    else
                    {
                        models.sessions.findOne({_id: sessionId }, (err,restwo)=>{
                            if(err)
                            {
                                response.status(400).send({
                                    success: false,
                                    message: errorHandler.getErrorMessage(err)
                                });

                            }
                            else if(!restwo)
                            {
                                response.status(400).send({
                                    success: false,
                                    message: "Not A valid Session"
                                });

                            }
                            else
                            {
                                let sessionId = restwo._id;
                                models.users.findOne({_id:req.user._id},(err,resthree)=>{
                                    if(err)
                                    {
                                        response.status(400).send({
                                            success: false,
                                            message: errorHandler.getErrorMessage(err)
                                        });

                                    }
                                    else if(!resthree)
                                    {
                                        response.status(400).send({
                                            success: false,
                                            message: " Not a valid User"
                                        });

                                    }
                                    else
                                {
                                          
                                 models.ratings.create(body,(err,res)=>{
                                    if(err) {
                                     response.status(400).send({
                                     success: false,
                                     message: errorHandler.getErrorMessage(err)
                                     });
                                 }
                                  else {
                                    models.ratings.findOneAndUpdate({_id: res._id},{$set:{sessionId: sessionId, userId: resthree._id}},{new:true},(err,resfinal)=>{
                                        if(err)
                                        {
                                            response.status(400).send({
                                                success: false,
                                                message: errorHandler.getErrorMessage(err)
                                            });
                                        }
                                        if(!res)
                                        {
                                            response.status(400).send({
                                                success: false,
                                                message: "Cannot Save Rating"
                                            });
                                        }
                                        else{
                                            response.status(200).send({
                                                success: true,
                                                message:"Rating Saved"
                                            })
                                        }
                                    })
                                }
                                })
                        }
                        })     
                    }
            })
        }
    })  
      
    }
    
}
    module.exports = _.merge(
        moreFunctions
    );
    