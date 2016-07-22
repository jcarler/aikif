var express = require('express');
var Merchant = require('../models/merchant');
var Company = require('../models/company');

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

router.delete('/', function (req, res) {
  Merchant.remove(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'All deleted'});
  });
});

module.exports = router;
