var express = require('express');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');
var dealService = require('../services/dealService');

var dealsFile = require('../dataInject/deals.json');


var router = express.Router();


router.get('/', function (req, res) {

  dealsFile.forEach(function (dealInjected) {
    var date = new Date();
    var timestamp = timestamp = date.getTime() - dealInjected.timestampGap;

    dealService.createDeal(dealInjected.moojPhone, dealInjected.description, timestamp)
      .then(function () {
        res.status(200).end();
      }, function (err) {
        res.send(err);
      });
  });

  res.json({message: 'Init OK'});
});

module.exports = router;
