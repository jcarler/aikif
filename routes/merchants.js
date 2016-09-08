var express = require('express');
var Merchant = require('../models/merchant');
var Company = require('../models/company');
var Deal = require('../models/deal');
var mongoose = require('mongoose');
var helper = require('sendgrid').mail;


var router = express.Router();


router.get('/', function (req, res) {
  var query = {};
  var category = req.query.category;

  if (category) {
    query.category = {$in: category.split(',')}
  }

  Merchant
    .find(query)
    .populate('company')
    .populate('category')
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
    .populate('category')
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
  merchant.location.coordinates = req.body.location;
  merchant.moojPhone = req.body.moojPhone;
  merchant.moojMail = req.body.moojMail;
  merchant.imageLink = req.body.imageLink;

  // save the bear and check for errors
  merchant.save(function (err) {
    if (err)
      res.send(err);

    var from_email = new helper.Email('contact.mooj@gmail.com');
    var to_email = new helper.Email(req.body.moojMail);
    var subject = 'Bienvenue sur Mooj!';
    var content = new helper.Content('text/html', '<h1 style="color:red;">Bonjour ' + req.body.name + ' !</h1>' +
      '<p style="font-size:15px;color:rgb(20,20,20)">Bienvenue dans la communauté Mooj :) <br/><br/>' +
      'Afin de publier de nouvelles annonces sur notre magnifique application, nous avons enregistré votre numéro de téléphone. Il vous suffit d\'envoyer un simple SMS au <a href="tel:+33756795972">0756795972</a>.<br/>' +
      'Top non ? Petit conseil: ajoutez ce numéro à vos contacts pour toujours pouvoir publier !<br/>' +
      'Si vous changez de numéro de téléphone, faites-le nous savoir!<br/><br/>' +
      'A bientôt sur <a href="http://www.mooj.ovh">Mooj</a></p>' +
      '<br/><br/>' +
      '<h4>Jérémie de Mooj</h4>');
    var mail = new helper.Mail(from_email, subject, to_email, content);

    var sg = require('sendgrid')(process.env.sendgrid_api_key);

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    sg.API(request, function(error, response) {

      res.status(200).end();

    });

    res.json({message: 'Merchant created'});
  });

});

router.put('/:id', function (req, res) {

  // save the bear and check for errors
  Merchant.findById(req.params.id, function (err, merchant) {
    if (err)
      res.send(err);

    merchant.name = req.body.name || merchant.name;
    merchant.pseudo = req.body.pseudo ||  merchant.pseudo;
    merchant.category = req.body.category ||  merchant.category;
    merchant.phone = req.body.phone || merchant.phone;
    merchant.email = req.body.email || merchant.email;
    merchant.adress = req.body.adress || merchant.adress;
    merchant.city = req.body.city || merchant.city;
    merchant.location.coordinates = req.body.location || merchant.location.coordinates;
    merchant.moojPhone = req.body.moojPhone || merchant.moojPhone;
    merchant.moojMail = req.body.moojMail || merchant.moojMail;
    merchant.imageLink = req.body.imageLink || merchant.imageLink;

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
      deal.category = merchant.category;

      // save the bear and check for errors
      deal.save(function (err) {
        if (err)
          res.send(err);

        res.json({message: 'Deal created'});
      });
    });

});

router.get('/:id/deals', function (req, res) {

  Merchant.findById(req.params.id, function (err, merchant) {
    if (err) {
      console.log(err);
      res.json({
        message: 'Merchant not found'
      });
      res.status(404).end();
    }

    Deal
      .find({
        merchant: mongoose.Types.ObjectId(merchant._id)
      })
      .populate('merchant')
      .exec(function (err, deals) {

        res.json(deals);
      });

  })
});

router.delete('/', function (req, res) {
  Merchant.remove(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'All deleted'});
  });
});

router.delete('/:id', function (req, res) {
  Merchant.findByIdAndRemove(req.params.id, function (err) {
    if (err)
      res.send(err);

    res.json({message: 'Merchant deleted'});
  });
});

module.exports = router;
