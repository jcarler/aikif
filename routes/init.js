var express = require('express');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');


var router = express.Router();


router.get('/', function (req, res) {
  var date = new Date();

  Merchant
    .find({moojPhone: '0366970527'})
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
      deal.name = 'Test inject';
      deal.description = 'Description';
      deal.timestamp = date.getTime();
      deal.merchant = merchant._id;

      // save the bear and check for errors
      deal.save(function (err) {
        if (err)
          res.send(err);

        res.json({message: 'Deal created'});
      });
    });
});

module.exports = router;
