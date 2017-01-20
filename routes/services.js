var express = require('express');
var router = express.Router();
var dealService = require('../services/dealService');

/* GET home page. */
router.post('/sms', function (req, res, next) {

  dealService.createDeal(req.body.From, req.body.Body)
    .then(function () {
      res.status(200).end();
    }, function (err) {
      res.send(err);
    });

});

router.post('/apiAi', function (req, res, next) {

  try {
    var string = JSON.stringify(req.body.result.parameters);
    var params = JSON.parse(string);

    dealService.getDeals().then(function (deals) {
      var deal = deals[0];

      res.json({
        "speech": deal.merchant.pseudo + " vous propose " + deal.description + ". Vous pouvez les joindre au " + deal.merchant.phone,
        "displayText": deal.merchant.pseudo + " vous propose " + deal.description + ". Vous pouvez les joindre au " + deal.merchant.phone,
        "source": "mooj"
      });
    });

    console.log("stringify", params);
    console.log("stringify params", params["geo-city"]);

  }
  catch (e) {
    console.log(e);
  }

  res.json({
    "speech": "Voici les deals à ",
    "displayText": "Voici les deals à ",
    "source": "mooj"
  });

});

module.exports = router;
