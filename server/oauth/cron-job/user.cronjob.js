// var cron = require('node-cron'),
//     DB = require('../models');

// // */5 * * * *
// // cron.schedule("02 13 * * *", function(){
// cron.schedule('59 23 * * *', function () {
//     // cron.schedule('20 09 * * *', function () {

//     DB.users.find({}, (req, res) => {
//         let now = new Date().getDate();
//         let arr = []
//         let ids = []
//         for (let index = 0; index < res.length; index++) {
//             // if (now - res[index].lastPlayed >= 2 || now - res[index].lastPlayed >= -30) {
//                 // console.log(now - res[index].lastPlayed >= 2)
//                 // console.log(now - res[index].lastPlayed < -1)
//                 if ((now - res[index].lastPlayed) > 1|| (now - res[index].lastPlayed) < -1) {

//                 arr.push(res[index]);
//             }
//         }
//         // console.log(arr)
//         for (let index = 0; index < arr.length; index++) {
//             ids.push(arr[index].id)
//         }
//         // console.log(ids)
//         let newfiltr = []
//         for (let index = 0; index < ids.length; index++) {
//             newfiltr.push({
//                 updateOne: {
//                     "filter": {
//                         "_id": ids[index]
//                     },
//                     "update": {
//                         "$set": {
//                             currentStreak: 0
//                         }
//                     },
//                     "upsert": false
//                 }
//             })
//         }

//         DB.users.bulkWrite(newfiltr).then((result) => {
//             //    console.log('Result: ', result);
//         })
//             .catch((err) => {
//                 console.log('Error: ', err);
//             })
//     })
// });