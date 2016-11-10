var mongoose = require('mongoose');
var Merchant = require('../models/merchant');
var Deal = require('../models/deal');

var tags = ['#appeler#'];

function filterTags(sms) {

  tags.forEach(function (tag) {
    if (sms.toLowerCase().indexOf(tag) >= 0) {
      // remove tag
      sms = sms.replace(tag, '');
    }
  });

  return sms;
}

var createDeal = function (phone, message, timestamp) {
  var date = new Date();

  if (message.toLowerCase().indexOf('#supprimercompte#') >= 0) {
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
        if (message.toLowerCase().indexOf('#supprimerdernier#') >= 0) {
          return Deal
            .findOneAndRemove({
              merchant: mongoose.Types.ObjectId(merchant[0]._id)
            })
            .sort({timestamp: -1})
            .exec();
        }
        // Supprimer tous les deals
        else if (message.toLowerCase().indexOf('#supprimertous#') >= 0) {
          return Deal
            .findAndRemove({
              merchant: mongoose.Types.ObjectId(merchant[0]._id)
            })
            .exec();
        }
        else {
          var deal = new Deal();      // create a new instance of the Deal model

          deal.actions = {};

          deal.actions.call = (merchant.preferences && merchant.preferences.call) || message.toLowerCase().indexOf('#appeler#') >= 0;

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