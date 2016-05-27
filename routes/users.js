var express = require('express');
var User = require('../models/user');
var mongoose = require('mongoose');

var router = express.Router();

mongoose.connect('mongodb://mooj:mooj@ds025792.mlab.com:25792/mooj');


router.get('/',function (req, res) {
  User.find(function (err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
});

router.post('/',function (req, res) {

  var user = new User();      // create a new instance of the User model
  user.name = req.body.name;
  user.imageLink = "";

  // save the bear and check for errors
  user.save(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'coucou ça marche!'});
  });
});

module.exports = router;
