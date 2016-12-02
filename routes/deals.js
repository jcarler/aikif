var express = require('express');
var Deal = require('../models/deal');
var Merchant = require('../models/merchant');
var mongoose = require('mongoose');
var https = require('https');
var rp = require('request-promise');
var dealService = require('../services/dealService');

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
                if (data.rows && data.rows.length > 0 && data.rows[0].elements.length > 0) {
                  results.forEach(function (deal, index) {
                    deal.route = data.rows[0].elements[index];
                  });
                }
                else {

                  function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
                    var R = 6371; // Radius of the earth in km
                    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
                    var dLon = deg2rad(lon2 - lon1);
                    var a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                      ;
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c; // Distance in km
                    return Math.round(d * 1000); // Distance in m
                  }

                  function deg2rad(deg) {
                    return deg * (Math.PI / 180)
                  }

                  results.forEach(function (deal) {

                    var distance = getDistanceFromLatLonInM(location.split(',')[0], location.split(',')[1], deal.merchant.location.coordinates[0], deal.merchant.location.coordinates[1]);
                    var duration = distance / 1000 * 12;

                    var realmin = Math.round(duration % 60);
                    var hours = Math.floor(duration / 60);

                    deal.route = {
                      distance: {
                        text: distance < 1000 ? (distance === 0 ? '1 m' : distance + ' m') : Math.round(distance / 100) / 10 + ' km',
                        value: distance
                      },
                      duration: {
                        text: (hours > 0 ? hours + ' heure' + (hours > 1 ? 's ' : ' ') : '' ) + (realmin === 0 ? '1' : realmin) + ' minute' + (realmin > 1 ? 's' : ''),
                        value: Math.round(duration)
                      },
                      status: "NOK"
                    };
                  });

                }

                return results;
              }, function (err) {
                res.send(err);
              });

          }
          else {
            finalPromise = Promise.resolve(results);
          }

          return finalPromise.then(function (deals) {
            return deals;
          }, function (err) {
            res.send(err);
          });

        })
        .then(function (deals) {
          res.json(deals);
        }, function (err) {
          res.send(err);
        });
    }, function (err) {
      res.send(err);
    });
});


// Create a deal
router.post('/', function (req, res) {

  dealService.createDeal(req.body.moojPhone, req.body.description)
    .then(function () {
      res.status(200).end();
    }, function (err) {
      res.send(err);
    });

});


// Delete all deals
router.delete('/', function (req, res) {
  Deal
    .remove()
    .then(function () {
      res.json({message: 'All deleted'});
    }, function (err) {
      res.send(err);
    });
});


// Get a deal
router.get('/:id', function (req, res) {
  Deal
    .getById(req.params.id)
    .exec()
    .then(function (deal) {
      res.json(deal);
    }, function (err) {
      res.send(err);
    });
});


// Delete a deal
router.delete('/:id', function (req, res) {
  Deal
    .findByIdAndRemove(req.params.id)
    .then(function () {
      res.json({message: 'Deal deleted'});
    }, function (err) {
      res.send(err);
    });
});

module.exports = router;

