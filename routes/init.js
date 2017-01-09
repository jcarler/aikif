var express = require('express');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');
var dealService = require('../services/dealService');

var dealsFile = require('../dataInject/deals.json');


var router = express.Router();


router.get('/', function (req, res) {
  var today = new Date();
  var tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 1);

  var day = tomorrow.getDate();
  var month = today.getMonth();
  var year = today.getFullYear();
  var antiDate = new Date(year, month, day);

  dealsFile.forEach(function (dealInjected) {

    var timestamp = antiDate.getTime() - dealInjected.timestampGap;

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
