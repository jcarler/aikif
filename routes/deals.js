var express = require('express');
var Deal = require('../models/deal');

var router = express.Router();


router.get('/', function (req, res) {
  Deal
    .find()
    .populate('merchant')
    .exec(function (err, deals) {
      if (err)
        res.send(err);

      res.json(deals);
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

  var deal = new Deal();      // create a new instance of the Deal model
  deal.name = req.body.name;
  deal.description = req.body.description;
  deal.timestamp = date.getTime();
  deal.imageLink = "";

  // save the bear and check for errors
  deal.save(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'coucou ça marche!'});
  });
});

module.exports = router;
