'use strict';

let mongoose = require('./db.server.connect'),
	Schema = mongoose.Schema;

let CategorySchema = new Schema({
        categoryName: {
            type:String
        },
        isDeleted:{
            type: Boolean,
            default: false
        },
        indexNumber:{
            type:Number
        }
});


module.exports = mongoose.model('category', CategorySchema);