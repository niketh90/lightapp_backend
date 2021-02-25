
const Models = require('../../models');
const errorHandler = require('./../errors.server.controller')
const getPrivacyPolicy = async (req, res) => {

    
      let privacyPolicyObj = await Models.privacy.findOne(Models.privacyPolicy)
      if(!privacyPolicyObj) {
        res.status(400).send({
            success: false,
            message: errorHandler.getErrorMessage(err)
        })
      }  
      else{
            return res.status(400).send(
              
                privacyPolicyObj.privacyPolicyHtml
              
              )
        }
    }

    const getTermsAndConditions = async (req, res) => {

    
        let termsObj = await Models.condition.findOne(Models.term)
        if(!termsObj) {
          res.status(400).send({
              success: false,
              message: errorHandler.getErrorMessage(err)
          })
        }  
        else{
              return res.status(400).send(
             
                  termsObj.termsHtml
                )
          }
      }

module.exports = {
    getPrivacyPolicy,
    getTermsAndConditions
}