var express = require('express');
var User = require('../models/user');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');
var mongoose = require('mongoose');

var router = express.Router();

router.get('/', function (req, res) {
  User
    .getAll()
    .exec(function (err, users) {
      if (err)
        res.send(err);

      res.json(users);
    })
});

router.post('/', function (req, res) {
  var user = new User();      // create a new instance of the User model
  user.following = req.body.following;

  // save the bear and check for errors
  user.save(function (err) {
    if (err)
      res.send(err);

    User
      .getById(req.params.id)
      .exec(function (err, user) {
        if (err) {
          res.send(err);
        }

        res.json(user);
      });
  });
});

router.put('/:id', function (req, res) {
  User
    .findById(req.params.id)
    .exec(function (err, user) {
      if (err)
        res.send(err);

      user.following = req.body.following || user.following;

      user.save(function (err) {
        if (err)
          res.send(err);

        User
          .getById(req.params.id)
          .exec(function (err, user) {
            if (err) {
              res.send(err);
            }

            res.json(user);
          });
      });
    });
});

router.get('/:id', function (req, res) {
  User
    .getById(req.params.id)
    .exec(function (err, user) {
      if (err) {
        res.send(err);
      }

      res.json(user);
    });
});

router.get('/:id/deals', function (req, res) {
  var following;
  var query = {};
  var category = req.query.category;

  var actualTimestamp = new Date().getTime();
  var lastDayTimestamp = actualTimestamp - 172800000;

  if (category) {
    query.category = {$in: category.split(',')}
  }

  User
    .findById(req.params.id)
    .exec(function (err, user) {
      if (err) {
        res.send(err);
      }

      following = user.following;
    })
    .then(function () {

      var merchants = following.map(function (merchantId) {
        return mongoose.Types.ObjectId(merchantId);
      });

      query.merchant = {$in: merchants};

      Deal
        .find(query)
        .where('timestamp').gt(lastDayTimestamp)
        .populate({
          path: 'merchant',
          model: 'Merchant',
          populate: {
            path: 'category',
            model: 'Category'
          }
        })
        .exec(function (err, deals) {

          res.json(deals);
        });
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
