var express = require('express');
var router = express.Router();
var User = require('../models/user');


router.post('/', function(req, res) {
  if (!req.body.name || !req.body.password || !req.body.name) {
    res.json({success: false, msg: 'Please pass name, email and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Email already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});


module.exports = router;
