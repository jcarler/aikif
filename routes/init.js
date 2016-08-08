var express = require('express');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');

var dealsFile = require('../dataInject/deals.json');


var router = express.Router();


router.get('/', function (req, res) {

  dealsFile.forEach(function(dealInjected) {
    Merchant
      .find({moojPhone: dealInjected.moojPhone})
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

        var date = new Date();
        var deal = new Deal();      // create a new instance of the Deal model
        deal.name = dealInjected.name;
        deal.description = dealInjected.description;
        deal.timestamp = date.getTime();
        deal.merchant = merchant[0]._id;

        // save the bear and check for errors
        deal.save(function (err) {
          if (err)
            res.send(err);

        });
      });
  });

  res.json({message: 'Init OK'});
});

module.exports = router;
