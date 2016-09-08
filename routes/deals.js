var express = require('express');
var Deal = require('../models/deal');
var Merchant = require('../models/merchant');
var mongoose = require('mongoose');
var https = require('https');

var router = express.Router();


router.get('/', function (req, res) {
  var actualTimestamp = new Date().getTime();
  var lastDayTimestamp = actualTimestamp - 172800000;
  var query = {};
  var category = req.query.category;
  var location = req.query.location;

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
    .populate('category')
    .exec(function (err, merchants) {
      if (err)
        res.send(err);

      if (!merchants) {
        return res.status(404).send();
      }

      merchants.map(function (merchant) {
        return mongoose.Types.ObjectId(merchant._id);
      });

      Deal
        .find({'merchant': {$in: merchants}})
        .sort({timestamp: -1})
        .where('timestamp').gt(lastDayTimestamp)
        .populate('merchant')
        .exec(function (err, deals) {
          if (err)
            res.send(err);
          var results = [];
          var rawDestinations = [];

          deals.forEach(function (deal) {
            var ob = deal.toObject();
            delete ob.__v;
            delete ob.merchant.__v;
            rawDestinations.push(ob.merchant.location.coordinates);
            results.push(ob);
          });

          if (location) {

            var origin = location.split(',')[0] + ',' + location.split(',')[1];
            var destinations = '';

            rawDestinations.forEach(function (coordinate) {
              destinations = destinations + coordinate[0] + ',' + coordinate[1] + '|'
            });

            var options = {
              hostname: 'maps.googleapis.com',
              port: 443,
              path: '/maps/api/distancematrix/json?origins=' + origin + '&destinations=' + destinations + '&mode=walking&language=fr-FR&key=AIzaSyC0NG1mGANovrnoM4Xx40ujcpal_kkPhrM',
              method: 'GET'
            };

            var req = https.request(options, function (response) {

              var body = '';
              response.on('data', function (chunk) {
                body += chunk;
              });

              response.on('end', function () {
                var data = JSON.parse(body);

                if (data.rows && data.rows.length > 0) {
                  results.forEach(function (deal, index) {
                    deal.route = data.rows[0].elements[index];
                  });
                }

                res.json(results);

              });
            });
            req.end();

            req.on('error', function (e) {
              console.error(e);
            });
          }
          else {
            res.json(results);
          }

        });
    });
});

router.get('/:id', function (req, res) {
  Deal
    .findById(req.params.id)
    .populate('merchant')
    .exec(function (err, deal) {
      if (err)
        res.send(err);

      res.json(deal);
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

router.delete('/:id', function (req, res) {
  Deal.findByIdAndRemove(req.params.id, function (err) {
    if (err)
      res.send(err);

    res.json({message: 'Deal deleted'});
  });
});

module.exports = router;
