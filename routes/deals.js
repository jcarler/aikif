var express = require('express');
var Deal = require('../models/deal');
var mongoose = require('mongoose');

var router = express.Router();

mongoose.connect('mongodb://mooj:mooj@ds025792.mlab.com:25792/mooj');


router.get('/',function (req, res) {
  Deal.find(function (err, deals) {
    if (err)
      res.send(err);

    res.json(deals);
  });
});

router.post('/',function (req, res) {

  var deal = new Deal();      // create a new instance of the Deal model
  deal.name = req.body.name;
  deal.description = req.body.description;

  // save the bear and check for errors
  deal.save(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'coucou ça marche!'});
  });
});

module.exports = router;
