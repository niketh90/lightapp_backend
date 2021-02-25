'use strict';
let multer = require('multer'),
    path = require('path'),
    Storage = multer.diskStorage({
        destination: function(req, file, callback) {
            callback(null, path.join(process.env.PWD, 'server/uploads'));
        },
        filename: function(req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    }),
    upload = multer({
        storage: Storage,
        fileFilter: function (req, file, cb) {

            var mimetype = /^image\//.test(file.mimetype);
            
            if (mimetype) {
                return cb(null, true);
            }
            cb({ message: "Error: File upload only supports images"}, false);
        }
    }),     
    uploadAllTypeOfFiles = multer({
        storage: Storage,
        fileFilter: function (req, file, cb) {

            var filetypes = /jpeg|jpg|docx|doc|pdf|png|bmp|bitmap|gif|txt|ppt/;
            var mimetype = filetypes.test(file.mimetype);
            var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

            if (mimetype && extname) {
            return cb(null, true);
            }
            cb("Error: File upload only supports the following filetypes - " + filetypes);
        }

    });
module.exports =  upload,uploadAllTypeOfFiles;