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

  console.log(req.body.result.parameters);


  try{
    var params = JSON.stringify(req.body.result.parameters);
    var param2 = JSON.parse(req.body.result.parameters);

    console.log(params);
    console.log(param2);

  }

  res.json({
    "speech": "Voici les deals à ",
    "displayText": "Voici les deals à ",
    "source": "mooj"
  });

});

module.exports = router;
