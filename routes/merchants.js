var express = require('express');
var Merchant = require('../models/merchant');
var User = require('../models/user');
var Deal = require('../models/deal');
var Company = require('../models/company');
var mongoose = require('mongoose');
var helper = require('sendgrid').mail;
var Promise = require('bluebird');

var router = express.Router();


router.get('/', function (req, res) {
  var query = {};
  var category = req.query.category;
  var userId = req.query.userId;

  if (category) {
    query.category = {$in: category.split(',')}
  }

  var queryPromise = Promise.resolve(query);

  if (userId) {
    queryPromise = User
      .findById(userId)
      .exec()
      .then(function (user) {
        query._id = {$nin: user.following};

        return query;
      });
  }

  queryPromise
    .then(function (query) {
      Merchant
        .find(query)
        .populate('company')
        .populate('category')
        .lean()
        .exec()
        .then(function (merchants) {

          var promises = [];

          merchants.forEach(function (merchant) {

            promises.push(
              User
                .find({'following': mongoose.Types.ObjectId(merchant._id)})
                .exec()
                .then(function (users) {

                  var result = merchant;

                  result.followers = {
                    totalCount: users.length,
                    value: users
                  };
                  return result;
                }, function (err) {
                  res.send(err);
                })
            );
          });

          return Promise.all(promises)
            .then(function (prom) {
              res.json(prom);
            }, function (err) {
              res.send(err);
            });
        }, function (err) {
          res.send(err);
        });
    });


});

router.get('/:id', function (req, res) {
  Merchant
    .findById(req.params.id)
    .populate('company')
    .populate('category')
    .exec()
    .then(function (merchant) {

      User
        .find({'following': mongoose.Types.ObjectId(merchant._id)})
        .exec()
        .then(function (users) {
          var result = merchant.toObject();

          result.followers = {
            totalCount: users.length,
            value: users
          };

          res.json(result);

        }, function (err) {
          res.send(err);
        });

    }, function (err) {
      res.send(err);
    });
})
;

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
  merchant
    .save()
    .then(function () {

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

      sg.API(request, function (error, response) {

        res.status(200).end();

      });

      res.json({message: 'Merchant created'});
    }, function (err) {
      res.send(err);
    });

});


router.post('/bulk', function (req, res) {

  req.body.forEach(function (newMerchant) {
    var merchant = new Merchant();
    merchant.name = newMerchant.name;
    merchant.pseudo = newMerchant.pseudo;
    merchant.category = newMerchant.category;
    merchant.phone = newMerchant.phone;
    merchant.email = newMerchant.email;
    merchant.adress = newMerchant.adress;
    merchant.city = newMerchant.city;
    merchant.location.coordinates = newMerchant.location;
    merchant.moojPhone = newMerchant.moojPhone;
    merchant.moojMail = newMerchant.moojMail;
    merchant.imageLink = newMerchant.imageLink;

    // save the bear and check for errors
    merchant
      .save()
      .then(function () {
        console.log('ok');
      }, function (err) {
        res.send(err);
      });
  });

  res.json({message: 'Merchants created'});

});

router.put('/:id', function (req, res) {

  // save the bear and check for errors
  Merchant
    .findById(req.params.id)
    .exec()
    .then(function (merchant) {

      merchant.name = req.body.name || merchant.name;
      merchant.pseudo = req.body.pseudo || merchant.pseudo;
      merchant.category = req.body.category || merchant.category;
      merchant.phone = req.body.phone || merchant.phone;
      merchant.email = req.body.email || merchant.email;
      merchant.adress = req.body.adress || merchant.adress;
      merchant.city = req.body.city || merchant.city;
      merchant.location.coordinates = req.body.location || merchant.location.coordinates;
      merchant.moojPhone = req.body.moojPhone || merchant.moojPhone;
      merchant.moojMail = req.body.moojMail || merchant.moojMail;
      merchant.imageLink = req.body.imageLink || merchant.imageLink;

      merchant
        .save()
        .then(function () {
          res.json({message: 'Merchant updated'});
        }, function (err) {
          res.send(err);
        });
    }, function (err) {
      res.send(err);
    });

});

router.post('/:id/deals', function (req, res) {
  var date = new Date();

  Merchant
    .findById(req.params.id)
    .exec()
    .then(function (merchant) {

      var deal = new Deal();      // create a new instance of the Deal model
      deal.name = req.body.name;
      deal.description = req.body.description;
      deal.timestamp = date.getTime();
      deal.merchant = merchant._id;
      deal.category = merchant.category;

      // save the bear and check for errors
      deal
        .save()
        .then(function () {
          res.json({message: 'Deal created'});
        }, function (err) {
          res.send(err);
        });
    }, function (err) {
      res.send(err);
    });

});

router.get('/:id/deals', function (req, res) {
  var maxItems = parseInt(req.query.limit) || 100;

  Merchant
    .findById(req.params.id)
    .exec()
    .then(function (merchant) {

      Deal
        .find({
          merchant: mongoose.Types.ObjectId(merchant._id)
        })
        .sort({timestamp: -1})
        .populate({
          path: 'merchant',
          model: 'Merchant',
          populate: {
            path: 'category',
            model: 'Category'
          }
        })
        .limit(maxItems)
        .exec()
        .then(function (deals) {

          var results = [];

          deals.forEach(function (deal) {
            var ob = deal.toObject();
            delete ob.__v;
            delete ob.merchant.__v;

            ob.time = deal.getTimestamp();

            delete ob.timestamp;

            results.push(ob);
          });

          res.json(results);
        }, function (err) {
          res.send(err);
        });

    }, function (err) {
      res.send(err);
    })
});

router.delete('/', function (req, res) {
  Merchant
    .remove()
    .then(function () {
      res.json({message: 'All deleted'});
    }, function (err) {
      res.send(err);
    });
});

router.delete('/:id', function (req, res) {
  Merchant
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(function () {
      res.json({message: 'Merchant deleted'});
    }, function (err) {
      res.send(err);
    });
});

module.exports = router;
