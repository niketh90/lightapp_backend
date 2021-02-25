'use strict';
const config = require('../config.server'),
      from = config.from,
      region = config.region,
      accessKeyId = config.accessKeyId,
      secretAccessKey = config.secretAccessKey;

var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: accessKeyId,
	secretAccessKey: secretAccessKey,
	region: region
  });
const ses = new AWS.SES({ apiVersion: "2010-12-01" });	
//const to = user.email;
// console.log('from', from)   

module.exports = {
    sendMail: (payload) => {
        return new Promise((resolve, reject) => {
            ses.sendEmail( { 
                Source: from, 
                Destination: { ToAddresses: payload.to },
                Message: {
                    Subject:{
                       Data: payload.subject
                    },
                    Body: {
                        Html: {
                            Data: payload.html
                        }
                    }
                }
             },
              function(err, data) {
                 if(err) {
                     reject(err)
                 } else {
                    resolve(data)
                 }
              })
        })
    }
    

}
