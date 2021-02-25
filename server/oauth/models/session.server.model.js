'use strict'

let mongoose  = require('./db.server.connect'),
    config = require('../../config.server'),
    Schema  = mongoose.Schema;

//Session Details

let SessionSchema = new Schema({
   
sessionName:{
    type: String
},
sessionType:{
    type: Number,
    default:1,
    enum:[config.type.video, config.type.audio]
},
sessionUrl: {
    type: String,
},
sessionThumbNail :{
    type: String
},
sessionDate:{
    type: Date
},
sessionAuthor:{
    type: Schema.Types.ObjectId,
    ref: 'author'
},
sessionCategory:{
    type: Schema.Types.ObjectId,
    ref:'category'

},
sessionDescription:{
    type: String
},
sessionTime:{
    type:Number,
},
sessionDate:{
    type: Date
},
ratingMessage:{
    type : String,
    // default: 'Enjoyed Your Session Please Rate Here.'
}


})

module.exports = mongoose.model('session', SessionSchema)