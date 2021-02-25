'use strict';
let mongoose = require('mongoose'),
    crypto = require('crypto'),
    models = require('../../oauth/models');
    

var crud = {
    me: (req, res) => {
        let password = req.body.password;
        models.users.find({},(err,result)=> {
            result.authenticate(password)
        })
    }
}

module.exports = crud;
