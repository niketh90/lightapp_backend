'use strict';

/**
 * Module dependencies.
 */
let mongoose = require('./db.server.connect'),
    Schema = mongoose.Schema;

let VideoSchema = new Schema({

    videoUrl: {
        type: String
        
    },
});

module.exports = mongoose.model('video', VideoSchema);