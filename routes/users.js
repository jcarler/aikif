var express = require('express');
var User = require('../models/user');

var router = express.Router();

router.get('/', function (req, res) {
  User
    .find()
    .populate('following')
    .exec(function (err, users) {
      if (err)
        res.send(err);

      res.json(users);
    });
});

router.post('/', function (req, res) {
  var user = new User();      // create a new instance of the User model
  user.following = req.body.following;

  // save the bear and check for errors
  user.save(function (err) {
    if (err)
      res.send(err);

    res.json(user);
  });
});

router.put('/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err)
      res.send(err);

    user.following = req.body.following || user.following;

    user.save(function (err) {
      if (err)
        res.send(err);

      res.json({message: 'User updated'});
    });
  });
});

router.get('/:id', function (req, res) {
  User
    .findById(req.params.id)
    .populate('following')
    .exec(function (err, user) {
      if (err) {
        res.send(err);
      }

      res.json(user);
    });
});

router.delete('/', function (req, res) {
  User.remove(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'All deleted'});
  });
});

module.exports = router;
