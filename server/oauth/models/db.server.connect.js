'use strict';

let mongoose = require('mongoose');
var url = "mongodb://localhost:27017/lightapp";

mongoose.connect(url, {
  useUnifiedTopology: true,
  useCreateIndex: true,
}, (error) => {
  console.log('connection error', error)
});


let timestamps = require('mongoose-timestamp');

mongoose.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'modified_at'
})

module.exports = mongoose;


