'use strict';

/**
 * Module dependencies.
 */
let mongoose = require('./db.server.connect'),
    Schema = mongoose.Schema;

let RatingSchema = new Schema({

    sessionId: {
        type: Schema.Types.ObjectId,
        ref:'session'
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    rating:{
        type: Number
    }
});

module.exports = mongoose.model('rating', RatingSchema);