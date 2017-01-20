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

  var params = JSON.parse(req.body.result.parameters);

  console.log(params);

  res.json({
    "speech": "Voici les deals à " + params.geo-city,
    "displayText": "Voici les deals à " + params.geo-city,
    "source": "mooj"
  });

});

module.exports = router;
