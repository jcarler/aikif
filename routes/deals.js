var express = require('express');
var Deal = require('../models/deal');
var Merchant = require('../models/merchant');
var mongoose = require('mongoose');

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
    var coords = [+location.split(',')[0],+location.split(',')[1]];

    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coords
        }
      }
    }
  }

  Merchant
    .find(query)
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

          res.json(deals);
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

      var deal = new Deal();      // create a new instance of the Deal model
      deal.name = req.body.name;
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
