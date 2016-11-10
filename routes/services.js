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

module.exports = router;
