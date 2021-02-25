'use strict'
let models = require('../../models'),
  _ = require('lodash'),
  appleReceiptVerify = require('node-apple-receipt-verify'),
  errorHandler = require('./../errors.server.controller'),
  mongoose = require('mongoose')
let Verifier = require('google-play-billing-validator');
let serviceAccount = require('../../../../api-7757670881433143686-20705-2ee5aa03dee0.json');
// const { updateProfile } = require('./users.crud.server.controller');
// const e = require('express');


let moreFunctions = {

  async saveReceipt(req, response) {
    try {
      let body = req.body
      body.userId = mongoose.Types.ObjectId(req.user._id);
      if (body.file) {

        // let products = [{ transactionId: '1000000677260100',
        // originalTransactionId: '1000000674872578',
        // bundleId: 'com.light.inc',
        // productId: 'com.light.annualPackage',
        // purchaseDate: 1591766664000,
        // expirationDate: 1591770264000,
        // quantity: 1 }]
        appleReceiptVerify.config({
          secret: "5ce07f5082534f8cb98e43abf47161ff",
          environment: ['sandbox']
        });

        appleReceiptVerify.validate({
          receipt: body.file,
          excludeOldTransactions: true
        }, async (err, products) => {
          if (err) {

            response.status(400).send({
              success: false,
              message: "Receipt Cannot be Verified",
              data: err
            })
          }
          else {
           products = JSON.parse(JSON.stringify(products))

            console.log("Stringy ", products)

            let jsonToUpdate = {
              userId: body.userId,
              // file: body.file,
              subscriptionType: 'ios',
              iosReceiptDetails:
                products[0]
            }
            let updatePurchase = await models.purchase.create(jsonToUpdate)

            response.status(200).send({
              success: true,
              message: "Receipt Successfully Saved",
              androidReceipt: 
              {
                expiryTimeMillis:updatePurchase.iosReceiptDetails.expirationDate || {}
            }

            })
          }
        });
      }


      else {
        let options = {
          email: serviceAccount.client_email,
          key: serviceAccount.private_key
        }

        let verifier = new Verifier(options)
        let receipt = {
          packageName: body.metaData.packageName,
          productId: body.metaData.productId,
          purchaseToken: body.metaData.purchaseToken
        };


        let promiseData = verifier.verifySub(receipt)
        promiseData.then(async function (res) {
          let purchaseToUpdate = {
            userId: body.userId,
            metaData: body.metaData,
            subscriptionType: 'android',
            androidReceiptDetails: res.payload
          }
       
          let updatedPurchase = await models.purchase.create(purchaseToUpdate)
         
          response.status(200).send({
            success: true,
            message: "Receipt Successfully Saved",
            androidReceipt: updatedPurchase.androidReceiptDetails || {}


          })
        })
          .catch(function (error) {
            response.status(200).send({
              success: true,
              message: "Cannot Save Receipt",
              data: error
            })

          })


      }
    }

    catch (error) {
      return response.status(500).send({
        success: false,
        message: error.message || "Something went wrong"
      })
    }
  },



  async verifyAndroidReceipt(req, response) {
    try {
      let date = req.body.date
      if(!date )
      {
        response.status(400).send({
          success:false,
          message:'date is required'
        })

      }
      else
      {   
      let streak = await models.users.findOne({ _id: req.user._id })
      let newStreak
      let updatedStreak 

      if (!streak) {
        response.status(404).send({
          success: false,
          message: "User Not Found",
        })
      }
      else 
      {
        let verPurchase = await models.purchase.find({ userId: req.user._id })

        if (verPurchase.length > 0) 
        {
          verPurchase = _.orderBy(verPurchase, ['created_at'], ['desc']);
          let purchase = verPurchase[0] || verPurchase
          Date.prototype.UTCfloor = function () {
            return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()));
        };
          let d = new Date(date)
          if (d.toString()===streak.lastPlayed.toString()) {
            newStreak = await models.users.findOneAndUpdate({ _id: streak._id }, { $set: { currentStreak:streak.currentStreak} }, { new: true })
            response.status(200).send({
              success: true,
              message: "Receipt Details",
              // user:{
              //   currentStreak: newStreak.currentStreak,
              //   healingTime: newStreak.healingTime,
              //   healingDays: newStreak.healingDays,
                
              // },
              androidReceipt: purchase.androidReceiptDetails || {}
  
            })
           
          }
          else 
           {
             let here = d - streak.lastPlayed
             let diff = here/86400000
             
             if(diff>1)
             {
               updatedStreak = await models.users.findOneAndUpdate({_id:streak._id},{$set:{currentStreak:0}},{new:true})

               response.status(200).send({
                success: true,
                message: "Receipt Details",
                user:{
                  currentStreak: updatedStreak.currentStreak,
                  healingTime: updatedStreak.healingTime,
                  healingDays: updatedStreak.healingDays,
                
                },
                androidReceipt: purchase.androidReceiptDetails || {}
    
              })
             }
             else
             {
              newStreak = await models.users.findOneAndUpdate({ _id: streak._id }, { $set: { currentStreak:streak.currentStreak} }, { new: true })
              
              response.status(200).send({
                success: true,
                message: "Receipt Details",
                user:{
                  currentStreak: newStreak.currentStreak,
                  healingTime: newStreak.healingTime,
                  healingDays: newStreak.healingDays,
                  
                },
                androidReceipt: purchase.androidReceiptDetails || {}
    
              })

             }
          }

  
        } 
        else {
          response.status(404).send({
            success: false,
            message: "No Subscriptions Found",
            user:{
              currentStreak: streak.currentStreak,
              healingTime: streak.healingTime,
              healingDays: streak.healingDays,
            
            },

          })

        }
      }
    }
  }
    catch (error) {
      return response.status(500).send({
        success: false,
        message: error.message || "Something went wrong"
      })
    }
  },

  async verifyReceiptIOS(req, response) {
    try {
      let date = req.body.date
      if(!date )
      {
        response.status(400).send({
          success:false,
          message:'date is required'
        })

      }else
      {
      let streak = await models.users.findOne({ _id: req.user._id })
      let newStreak
      let updatedStreak 
      if (!streak) {
        response.status(404).send({
          success: false,
          message: "User Not Found",
        })
      }
      else
      {
      let verPurchase = await models.purchase.find({ userId: req.user._id })
      if (verPurchase.length > 0) {
        verPurchase = _.orderBy(verPurchase, ['created_at'], ['desc']);
        let purchase = verPurchase[0] || verPurchase || ""
     
        Date.prototype.UTCfloor = function () {
          return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()));
      };
        let d = new Date(date)
        if (d.toString()===streak.lastPlayed.toString()) {
          newStreak = await models.users.findOneAndUpdate({ _id: streak._id }, { $set: { currentStreak:streak.currentStreak} }, { new: true })
          response.status(200).send({
            success: true,
            message: "Receipt Details",
            user:{
              currentStreak: newStreak.currentStreak,
              healingTime: newStreak.healingTime,
              healingDays: newStreak.healingDays,
              
            },
            androidReceipt: {
              expiryTimeMillis:purchase.iosReceiptDetails.expirationDate || {}
            }

          })
         
        }
        else 
         {
           let here = d - streak.lastPlayed
           let diff = here/86400000
           if(diff>1)
           {
             updatedStreak = await models.users.findOneAndUpdate({_id:streak._id},{$set:{currentStreak:0}},{new:true})

             response.status(200).send({
              success: true,
              message: "Receipt Details",
              user:{
                currentStreak: updatedStreak.currentStreak,
                healingTime: updatedStreak.healingTime,
                healingDays: updatedStreak.healingDays,
              
              },
              // androidReceipt: purchase.iosReceiptDetails || {}
              androidReceipt: {
                expiryTimeMillis:purchase.iosReceiptDetails.expirationDate || {}
              }
  
            })
           }
           else
           {
            newStreak = await models.users.findOneAndUpdate({ _id: streak._id }, { $set: { currentStreak:streak.currentStreak} }, { new: true })
            response.status(200).send({
              success: true,
              message: "Receipt Details",
              user:{
                currentStreak: newStreak.currentStreak,
                healingTime: newStreak.healingTime,
                healingDays: newStreak.healingDays,
                
              },
              // androidReceipt: purchase.iosReceiptDetails || {}
              androidReceipt: {
                expiryTimeMillis:purchase.iosReceiptDetails.expirationDate || {}
              }
  
            })

           }
        }

      }
      else {
        response.status(404).send({
          success: false,
          message: "No Subscriptions Found",
          user:{
            currentStreak: streak.currentStreak,
            healingTime: streak.healingTime,
            healingDays: streak.healingDays,
          
          },

        })

      }
    }
  }
}
    catch (error) {
      response.status(500).send({
        success: false,
        message: errorHandler.getErrorMessage(error),
      })

    }
  },

  getAllSubscriptions(req, response)
  {
    let params = req.query;
        models.purchase.aggregate([  {
          $lookup: {
              from: 'users',
              as: 'user',
              let: {
                  user: '$userId'
              },
              pipeline: [
                  {
                      "$match": { "$expr": { "$eq": ["$_id", "$$user"] } }
                  },
                  {
                      $project: {
                          "firstName": 1,
                          "lastName": 1,
                          "email": 1
                      }
                  }
              ],

          }

      },
      {
          $unwind: ("$user")
      }
        ])
            .exec((err, result) => {
              // console.log(result)

                if (err) {
                    response.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    response.status(200).json(result);
                }
            })
  }
}

module.exports = _.merge(
  moreFunctions
);