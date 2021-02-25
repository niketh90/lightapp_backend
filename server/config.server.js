'use strict';
module.exports = {
	secret: 'P16s2vsj6BRyFUKomxXG',
	roles: {
		admin: 1,
		user: 2,
	},
	type: {
		video: 1,
		audio: 2,
	},
	// serverUrl: 'http://localhost:3000/',
	serverUrl: 'https://api.lightforcancer.com/',
	// serverUrl: 'http://ec2-3-19-63-208.us-east-2.compute.amazonaws.com:3000/',

	// serverUrl: process.env.NODE_ENV === 'production' ? 'http://ec2-18-223-235-54.us-east-2.compute.amazonaws.com:3000/' : 'http://localhost:3000/',
	authPrefix: 'JWT',
	sessionExpire: 15552000,
	facebook: {
        // clientID: "663173197852803",
		// clientSecret: "19638b171036448de2f1e6e9ec971932"
		clientID: "273195194061042",
        clientSecret: "f4a618e4d409dbc15b7915915b029606"
	},
	google:{
		clientID2:"1074332195885-reunf48l7evvn32pmm7g01r0s430o3mo.apps.googleusercontent.com",
		clientID1:"1074332195885-vuatkl4ah20s3gv3nqdukfue18fgu5h5.apps.googleusercontent.com"
		// clientSecret: "2K1x-3zcyVN24cwKdkDgBm3K"
	},
	apple: {
        clientID: "",
        clientSecret:"" ,
	},
	androidPushConfig: {
		
		fcmSender:`AAAA-iMwXC0:APA91bHmO5l7mQaln26AKcuD4rZXsqCCYAQAM1q1ObFbduSAnEEY4f4DkAhvVlk9N-QqWl47yZE1GLfkkUj0sfF-ngulc3FMzHEd80F843GhilTD2juNzJDsgpAcnZ4ba90yiV1gF8CI`
	},
	sendEmail:{
		user:'info@lightforcancer.com',
		pass:'Light123&%',
		from:'info@lightforcancer.com',
	},
	verificationRoute:{
		verify : '/verificationsuccess'
		// verify : 'https://www.google.com'
	}
}