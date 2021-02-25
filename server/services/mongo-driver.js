const mongo = require('mongoskin'),
      utills = require('./utills'),
      connectingString =  utills.getMongoConnectingString(),
      db = mongo.db(connectingString);


   
let getNextSequence = ( name, referenceValue, increment =1 , callback ) => {
  
  db.collection('counters').findAndModify(
    { "_id": name, reference_value: {$in : [referenceValue]} },
    {},
    { "$inc": { "seq": increment } },
    { "new": true, "upsert": true },
    function(err,doc) {
      callback(err,doc);
    }
  );

}   

// getNextSequence('task_seq', '5a3a1d3e1d3da44f1e1a0372', 1 , (err, seq) => {
//     console.log(err, seq)
// })