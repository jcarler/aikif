var express = require('express');
var User = require('../models/user');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');

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
  var promises = [];

  promises.push(User
    .findById(req.params.id)
    .exec()
    .then(function (user) {

      following = user.following;

      var merchants = following.map(function (merchantId) {
        return mongoose.Types.ObjectId(merchantId).toString();
      });

      return merchants;
    }));

  if (category) {
    query.category = {$in: category.split(',')};

    promises.push(Merchant
      .find(query)
      .exec()
      .then(function (merchants) {
        if (!merchants) {
          return res.status(404).send();
        }

        var merchantIds = merchants.map(function (merchant) {
          //return mongoose.Types.ObjectId(merchant._id);
          return merchant._id.toString();
        });

        return merchantIds;
      }));
  }


  Promise.all(promises)
    .then(function (promises) {

      var merchants = [];

      if (category) {
        merchants = _.intersection(promises[0], promises[1]);
      }
      else {
        merchants = promises[0];
      }

      return merchants.map(function(merchant) {
        return mongoose.Types.ObjectId(merchant);
      });
    })
    .then(function (merchantIds) {

      Deal
        .find({merchant: {$in: merchantIds}})
        .where('timestamp').gt(lastDayTimestamp)
        .populate({
          path: 'merchant',
          model: 'Merchant',
          populate: {
            path: 'category',
            model: 'Category'
          }
        })
        .exec()
        .then(function (deals) {
          res.json(deals);
        });

    })
});

router.delete('/', function (req, res) {
  User.remove(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'All deleted'});
  });
});

module.exports = router;
