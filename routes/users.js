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

          var results = [];

          deals.forEach(function (deal) {
            var ob = deal.toObject();
            delete ob.__v;
            delete ob.merchant.__v;

            var dealTime = new Date(ob.timestamp);

            var tmp = now - dealTime;

            var diff = {};                       // Initialisation du retour

            tmp = Math.floor(tmp / 1000);             // Nombre de secondes entre les 2 dates
            diff.sec = tmp % 60;                    // Extraction du nombre de secondes

            tmp = Math.floor((tmp - diff.sec) / 60);    // Nombre de minutes (partie entière)
            diff.min = tmp % 60;                    // Extraction du nombre de minutes

            tmp = Math.floor((tmp - diff.min) / 60);    // Nombre d'heures (entières)
            diff.hour = tmp % 24;                   // Extraction du nombre d'heures

            tmp = Math.floor((tmp - diff.hour) / 24);   // Nombre de jours restants
            diff.day = tmp;

            ob.time = {
              raw: ob.timestamp,
              valueText: (now.getDay() > dealTime.getDay() ? 'Hier à ' : 'Aujourd\'hui à ' )+ dealTime.getHours() + 'h' + dealTime.getMinutes(),
              differenceText: 'Il y a '+ (diff.hour >= 1 ? diff.hour + 'h' : '') + (diff.min > 0 ? diff.min : '') + (diff.hour >= 1 ? '' : 'mn')
            };

            delete ob.timestamp;

            results.push(ob);
          });


          res.json(results);
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
