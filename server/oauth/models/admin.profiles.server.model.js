'use strict';

/**
 * Module dependencies.
 */
let mongoose = require('./db.server.connect'),
    Schema = mongoose.Schema;

let AdminSchema = new Schema({

    firstName: {
        type: String,
    },
    lastName:{
        type : String

    },

});

module.exports = mongoose.model('adminProfile', AdminSchema);