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
    .exec()
    .then(function (users) {
      res.json(users);
    }, function (err) {
      res.send(err);
    });
});

router.post('/', function (req, res) {
  var user = new User();      // create a new instance of the User model
  user.following = req.body.following;
  user.name = req.body.name || user.name;

  // save the bear and check for errors
  user
    .save()
    .then(function (user) {
      return User.populate(user, {path: "following"}).exec();
    })
    .then(function (user) {
      res.json(user);
    }, function (err) {
      res.send(err);
    });
});

router.put('/:id', function (req, res) {
  User
    .findById(req.params.id)
    .exec()
    .then(function (user) {

      user.following = req.body.following || user.following;
      user.name = req.body.name || user.name;

      user
        .save()
        .then(function (user) {
          return User.populate(user, {path: "following"}).exec();
        })
        .then(function (user) {
          res.json(user);
        }, function (err) {
          res.send(err);
        });
    }, function (err) {
      res.send(err);
    });
});

router.get('/:id', function (req, res) {
  User
    .getById(req.params.id)
    .exec()
    .then(function (user) {
      res.json(user);
    }, function (err) {
      res.send(err);
    });
});

router.get('/:id/deals', function (req, res) {
  var following;
  var query = {};
  var category = req.query.category;

  var now = new Date();
  var actualTimestamp = now.getTime();
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
    }, function (err) {
      res.send(err);
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
      }, function (err) {
        res.send(err);
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

      return merchants.map(function (merchant) {
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

          var results = [];

          deals.forEach(function (deal) {
            var ob = deal.toObject();
            delete ob.__v;
            delete ob.merchant.__v;

            ob.time = deal.getTimestamp();

            delete ob.timestamp;

            results.push(ob);
          });

          res.json(results);
        }, function (err) {
          res.send(err);
        });

    }, function (err) {
      res.send(err);
    });
});

router.delete('/', function (req, res) {
  User
    .remove()
    .then(function () {
      res.json({message: 'All deleted'});
    }, function (err) {
      res.send(err);
    });
});

router.delete('/:id', function (req, res) {
  User
    .findByIdAndRemove(req.params.id)
    .then(function () {
      res.json({message: 'User deleted'});
    }, function (err) {
      res.send(err);
    });
});

module.exports = router;
