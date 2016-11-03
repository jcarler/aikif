var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var DealSchema = new Schema({
  description: String,
  timestamp: Number,
  actions: [{
    code: String,
    href: String
  }],
  merchant: {type: ObjectId, ref: 'Merchant'}
});

DealSchema.statics.getById = function (id) {
  return this
    .findById(id)
    .populate({
      path: 'merchant',
      model: 'Merchant',
      populate: {
        path: 'category',
        model: 'Category'
      }
    });
};

DealSchema.methods.getTimestamp = function () {
  var now = new Date();
  var dealTime = new Date(this.timestamp);
  var tmp = now - dealTime;
  var diff = {};                       // Initialisation du retour

  tmp = Math.floor(tmp / 1000);             // Nombre de secondes entre les 2 dates
  diff.sec = tmp % 60;                    // Extraction du nombre de secondes

  tmp = Math.floor((tmp - diff.sec) / 60);    // Nombre de minutes (partie entière)
  diff.min = tmp % 60;                    // Extraction du nombre de minutes

  tmp = Math.floor((tmp - diff.min) / 60);    // Nombre d'heures (entières)
  diff.hour = tmp % 24;                   // Extraction du nombre d'heures

  tmp = Math.floor((tmp - diff.hour) / 24);   // Nombre de jours restants
  diff.day = tmp;

  var valueText = '';

  if (diff.day <= 1 && now.getDay() === dealTime.getDay()) {
    valueText = 'Aujourd\'hui';
  }
  else if (diff.day < 1 && now.getDay() > dealTime.getDay()) {
    valueText = 'Hier'
  }
  else {
    switch (dealTime.getDay()) {
      case 0:
        valueText = 'Dimanche';
        break;
      case 1:
        valueText = 'Lundi';
        break;
      case 2:
        valueText = 'Mardi';
        break;
      case 3:
        valueText = 'Mercredi';
        break;
      case 4:
        valueText = 'Jeudi';
        break;
      case 5:
        valueText = 'Vendredi';
        break;
      case 6:
        valueText = 'Samedi';
        break;
    }
  }

  return {
    raw: this.timestamp,
    valueText: valueText + ' à ' + dealTime.getHours() + 'h' + dealTime.getMinutes(),
    differenceText: 'Il y a ' + (diff.day > 0 ? diff.day + 'j ' : '') + (diff.hour >= 1 ? diff.hour + 'h ' : '') + (diff.min > 0 ? diff.min : '') + 'mn'
  };

};

module.exports = mongoose.model('Deal', DealSchema);