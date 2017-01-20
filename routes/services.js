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

  console.log(req.body.results.parameters);

  res.send({
    "speech": "Hello Darkness my old friend",
    "displayText": "Hello darkness my old fried",
    "source": "mooj"
  });

});

module.exports = router;
