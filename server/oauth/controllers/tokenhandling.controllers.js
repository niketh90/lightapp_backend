const jwt = require('jsonwebtoken'),
  Config = require('../../config.server');
//  var token = jwt.sign({data : user}, config.secret, {
//   expiresIn: config.sessionExpire // in seconds
// })

let createToken = function (res, auth) {
  return jwt.sign({
    data: res
  }, Config.secret
    /*, {
      expiresIn: Config.JWT.expire
    }*/
  );
};

let generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  next();
};

let sendToken = function (req, res) {
  res.status(200).send({
    token: req.token,
    // prefix: Config.prefix,
    // expiresIn: Config.JWT.expire
  });
};

let setTokenInCoockies = function (req, res) {
  res.cookie('Authorization', `${Config.JWT.prefix} ${req.token}`, { maxAge: 900000, httpOnly: false });
  res.status(200).send({
    token: req.token,
    prefix: Config.JWT.prefix,
    expiresIn: Config.JWT.expire
  });
}

module.exports = {
  createToken,
  generateToken,
  sendToken,
  setTokenInCoockies
}