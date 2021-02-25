'use strict';
const crypto = require("crypto");

 module.exports = {
    getRandomString: (length) => {
        let str = '';
        
        if(length) {
            str = crypto.randomBytes(length).toString('hex');
            str = str.substring(length)
        }
        
        return str;
    },
    getMongoConnectingString: () => {
        return 'mongodb://localhost:27017/lightapp'
    }
}
