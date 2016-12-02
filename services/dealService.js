var mongoose = require('mongoose');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');
var _ = require('lodash');

var tags = ['#appeler#', '#reserversms#', '#uber#', '#fourchette#'];

function filterTags(sms) {
  tags.forEach(function (tag) {
    if (sms.toLowerCase().indexOf(tag) >= 0) {
      // remove tag
      sms = sms.replace(tag, '');
    }
  });

  return sms;
}

function hasTag(message, tag) {
  return message.toLowerCase().indexOf(tag) >= 0;
}

function getExternalLinks(message, merchant) {
  var externalLinks = [];

  if ((merchant.preferences && merchant.preferences.uber) || hasTag(message, '#uber#')) {
    var uberLink = _.filter(merchant.externalLinks, function (externalLink) {
      return externalLink.code === 'uber';
    });

    externalLinks = externalLinks.concat(uberLink);
  }

  if ((merchant.preferences && merchant.preferences.lafourchette) || hasTag(message, '#fourchette#')) {
    var fourchetteLink = _.filter(merchant.externalLinks, function (externalLink) {
      return externalLink.code === 'lafourchette';
    });

    externalLinks = externalLinks.concat(fourchetteLink);
  }

  return externalLinks;
}

var createDeal = function (phone, message, timestamp) {
  var date = new Date();

  if (hasTag(message, '#supprimercompte#')) {
    return Merchant
      .findAndRemove({moojPhone: phone})
      .exec();
  }
  else {
    return Merchant
      .find({moojPhone: phone})
      .exec()
      .then(function (merchant) {

        // Supprimer le dernier deal
        if (hasTag(message, '#supprimerdernier#')) {
          return Deal
            .findOneAndRemove({
              merchant: mongoose.Types.ObjectId(merchant[0]._id)
            })
            .sort({timestamp: -1})
            .exec();
        }
        // Supprimer tous les deals
        else if (hasTag(message, '#supprimertous#')) {
          return Deal
            .findAndRemove({
              merchant: mongoose.Types.ObjectId(merchant[0]._id)
            })
            .exec();
        }
        else {
          var deal = new Deal();      // create a new instance of the Deal model

          deal.actions = {};
          deal.externalLinks = getExternalLinks(message, merchant[0]);


          deal.actions.call = (merchant.preferences && merchant.preferences.call) || hasTag(message, '#appeler#');
          deal.actions.reserversms = (merchant.preferences && merchant.preferences.reserversms) || hasTag(message, '#reserversms#');

          deal.description = filterTags(message);
          deal.timestamp = timestamp || date.getTime();
          deal.merchant = merchant[0]._id;

          // save the deal and check for errors
          return deal
            .save();
        }
      });
  }
};

module.exports = {
  createDeal: createDeal
};