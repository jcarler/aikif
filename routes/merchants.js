var express = require('express');
var Merchant = require('../models/merchant');
var Company = require('../models/company');
var Deal = require('../models/deal');

var router = express.Router();


router.get('/', function (req, res) {
  Merchant
    .find()
    .populate('company')
    .exec(function (err, merchants) {
      if (err)
        res.send(err);

      res.json(merchants);
    });
});

router.get('/:id', function (req, res) {
  Merchant
    .findById(req.params.id)
    .populate('company')
    .exec(function (err, merchant) {
      if (err)
        res.send(err);

      res.json(merchant);
    });
});

router.post('/', function (req, res) {

  var merchant = new Merchant();
  merchant.name = req.body.name;
  merchant.pseudo = req.body.pseudo;
  merchant.category = req.body.category;
  merchant.phone = req.body.phone;
  merchant.email = req.body.email;
  merchant.adress = req.body.adress;
  merchant.city = req.body.city;
  merchant.location = req.body.location;
  merchant.moojPhone = req.body.moojPhone;
  merchant.moojMail = req.body.moojMail;
  merchant.imageLink = req.body.imageLink;

  // save the bear and check for errors
  merchant.save(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'Merchant created'});
  });

});

router.put('/:id', function (req, res) {

  // save the bear and check for errors
  Merchant.findById(req.params.id, function (err, merchant) {
    if (err)
      res.send(err);

    merchant.name = req.body.name;
    merchant.pseudo = req.body.pseudo;
    merchant.category = req.body.category;
    merchant.phone = req.body.phone;
    merchant.email = req.body.email;
    merchant.adress = req.body.adress;
    merchant.city = req.body.city;
    merchant.location = req.body.location;
    merchant.moojPhone = req.body.moojPhone;
    merchant.moojMail = req.body.moojMail;
    merchant.imageLink = req.body.imageLink;

    merchant.save(function (err) {
      if (err)
        res.send(err);

      res.json({message: 'Merchant updated'});
    });
  });

});

router.post('/:id/deals', function (req, res) {
  var date = new Date();

  Merchant
    .findById(req.params.id)
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
      deal.name = req.body.name;
      deal.description = req.body.description;
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

router.delete('/', function (req, res) {
  Merchant.remove(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'All deleted'});
  });
});

module.exports = router;
