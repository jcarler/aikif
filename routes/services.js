var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');


/* GET home page. */
router.post('/sms', function (req, res, next) {
  var date = new Date();

  Merchant
    .find({moojPhone: req.body.From})
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

      var sms = req.body.Body;

      // Supprimer le dernier deal
      if (sms.toLowerCase().indexOf('#supprimerdernier#') >= 0) {
        Deal
          .findOneAndRemove({
            merchant: mongoose.Types.ObjectId(merchant._id)
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
        deal.description = sms;
        deal.timestamp = date.getTime();
        deal.merchant = merchant[0]._id;

        // save the bear and check for errors
        deal.save(function (err) {
          if (err)
            res.send(err);

          res.status(200).end();
        });
      }
    });

});

module.exports = router;
