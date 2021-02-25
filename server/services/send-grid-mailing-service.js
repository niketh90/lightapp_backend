'use strict';
const config = require('../config.servers') ,
    sgMail = require('sendgrid')(config.SENDGRID_API_KEY);

module.exports = {
    sendMail: function (payload = {}, cb) {
        var request = sgMail.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: {
                personalizations: [
                    {
                        to: [
                            {
                                email: payload.to
                            }
                        ],
                        subject: payload.subject
                    }
                ],
                from: {
                    // email: 'raj@dbcollective.co' // 'noreply@gmail.com'
                },
                content: [
                    {
                        type: 'text/html',
                        value: payload.html
                    }
                ]
            }
        });

        // With promise
        sgMail.API(request)
            .then((response) => {
                cb(null, response.statusCode);
            })
            .catch(function (error) {
                // error is an instance of SendGridError
                // The full response is attached to error.response
                cb(error, null);
            });
    }
}
