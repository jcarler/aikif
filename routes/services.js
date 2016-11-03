var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');


/* GET home page. */
router.post('/sms', function (req, res, next) {
  var date = new Date();
  var sms = req.body.Body;

  if (sms.toLowerCase().indexOf('#supprimercompte#') >= 0) {
    Merchant
      .findAndRemove({moojPhone: req.body.From})
      .exec()
      .then(function () {
        res.status(200).end();
      }, function (err) {
        res.send(err);
      });
  }
  else {
    Merchant
      .find({moojPhone: req.body.From})
      .exec()
      .then(function (merchant) {

        // Supprimer le dernier deal
        if (sms.toLowerCase().indexOf('#supprimerdernier#') >= 0) {
          Deal
            .findOneAndRemove({
              merchant: mongoose.Types.ObjectId(merchant[0]._id)
            })
            .sort({timestamp: -1})
            .exec()
            .then(function () {
              res.status(200).end();
            }, function (err) {
              res.send(err);
            });
        }
        // Supprimer tous les deals
        else if (sms.toLowerCase().indexOf('#supprimertous#') >= 0) {
          Deal
            .findAndRemove({
              merchant: mongoose.Types.ObjectId(merchant[0]._id)
            })
            .exec()
            .then(function () {
              res.status(200).end();
            }, function (err) {
              res.send(err);
            });
        }
        else {
          var deal = new Deal();      // create a new instance of the Deal model

          deal.actions = {
            external: merchant.externalLinks
          };

          deal.actions.call = (merchant.preferences && merchant.preferences.call) || sms.toLowerCase().indexOf('#call#') >= 0;

          if (sms.toLowerCase().indexOf('#call#') >= 0) {
            // remove tag

            sms = sms.replace('#call#', '');
          }

          deal.description = sms;
          deal.timestamp = date.getTime();
          deal.merchant = merchant[0]._id;

          // save the deal and check for errors
          deal
            .save()
            .then(function () {
              res.status(200).end();
            }, function (err) {
              res.send(err);
            });
        }
      }, function (err) {
        res.send(err);
      });
  }

});

module.exports = router;
