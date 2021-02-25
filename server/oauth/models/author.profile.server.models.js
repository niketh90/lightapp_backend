'use strict';

/**
 * Module dependencies.
 */
let mongoose = require('./db.server.connect'),
    Schema = mongoose.Schema;

let authorSchema = new Schema({

    authorName: {
        type: String,
    },
    authorImage:{
        type : String
    },
    authorWebsite:{
        type:String
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

});

module.exports = mongoose.model('author',authorSchema);