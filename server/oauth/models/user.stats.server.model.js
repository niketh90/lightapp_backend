'use strict';

/**
 * Module dependencies.
 */
let mongoose = require('./db.server.connect'),
    Schema = mongoose.Schema;

let StatsSchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
    },
    sessionId: {
        type: Schema.Types.ObjectId,
    },
    authorId:{
        type:Schema.Types.ObjectId
    }
 
});

module.exports = mongoose.model('sessionstats', StatsSchema);