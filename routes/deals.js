var express = require('express');
var Deal = require('../models/deal');
var Merchant = require('../models/merchant');
var mongoose = require('mongoose');
var https = require('https');
var rp = require('request-promise');

var router = express.Router();


router.get('/', function (req, res) {
  var actualTimestamp = new Date().getTime();
  var lastDayTimestamp = actualTimestamp - 172800000;
  var query = {};
  var category = req.query.category;
  var location = req.query.location;
  var maxItems = parseInt(req.query.limit) || 100;

  if (category) {
    query.category = {$in: category.split(',')}
  }

  if (location) {
    var maxDistance = +req.query.distance || 100000;
    var coords = [+location.split(',')[0], +location.split(',')[1]];

    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coords
        },
        $maxDistance: maxDistance
      }
    }
  }

  Merchant
    .find(query)
    .exec()
    .then(function (merchants) {
      if (!merchants) {
        return res.status(404).send();
      }

      merchants.map(function (merchant) {
        return mongoose.Types.ObjectId(merchant._id);
      });

      return merchants;
    })
    .then(function (merchantsIds) {

      Deal
        .find({'merchant': {$in: merchantsIds}})
        .sort({timestamp: -1})
        .limit(maxItems)
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
          var rawDestinations = [];

          deals.forEach(function (deal) {
            var ob = deal.toObject();
            delete ob.__v;
            delete ob.merchant.__v;

            ob.time = deal.getTimestamp();

            delete ob.timestamp;

            rawDestinations.push(ob.merchant.location.coordinates);
            results.push(ob);
          });

          var finalPromise;

          if (location) {

            var origin = location.split(',')[0] + ',' + location.split(',')[1];
            var destinations = '';

            rawDestinations.forEach(function (coordinate) {
              destinations = destinations + coordinate[0] + ',' + coordinate[1] + '|'
            });

            finalPromise = rp({
              uri: 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + origin + '&destinations=' + destinations + '&mode=walking&language=fr-FR&key=AIzaSyC0NG1mGANovrnoM4Xx40ujcpal_kkPhrM',
              headers: {},
              json: true
            })
              .then(function (data) {
                if (data.rows && data.rows.length > 0) {
                  results.forEach(function (deal, index) {
                    deal.route = data.rows[0].elements[index];
                  });
                }

                return results;
              });

          }
          else {
            finalPromise = Promise.resolve(results);
          }

          return finalPromise.then(function(deals) {
            return deals;
          });

        })
        .then(function(deals) {
          res.json(deals);
        });
    });
});

router.post('/', function (req, res) {
  var date = new Date();

  Merchant
    .find({moojPhone: req.body.moojPhone})
    .exec(function (err, merchant) {
      if (err) {
        console.log(err);
        res.json(
          {
            message: 'Merchant not found'
          }
        );
        res.status(404).end();
      }

      if (req.body.description.toLowerCase().indexOf('#supprimerdernier#') >= 0) {

        Deal
          .findOneAndRemove({
            merchant: mongoose.Types.ObjectId(merchant[0]._id)
          })
          .sort({timestamp: -1})
          .exec(function (err) {
            if (err)
              res.send(err);

            res.status(200).end();
          });
      }
      else {

        var deal = new Deal();      // create a new instance of the Deal model
        deal.description = req.body.description;
        deal.timestamp = date.getTime();
        deal.merchant = merchant[0]._id;
        deal.category = merchant[0].category;

        // save the bear and check for errors
        deal.save(function (err) {
          if (err)
            res.send(err);

          res.json({message: 'Deal created'});
        });
      }
    });

});

router.delete('/', function (req, res) {
  Deal.remove(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'All deleted'});
  });
});


router.get('/:id', function (req, res) {
  Deal
    .getById(req.params.id)
    .exec(function (err, deal) {
      if (err)
        res.send(err);

      res.json(deal);
    });
});

router.delete('/:id', function (req, res) {
  Deal.findByIdAndRemove(req.params.id, function (err) {
    if (err)
      res.send(err);

    res.json({message: 'Deal deleted'});
  });
});

module.exports = router;
