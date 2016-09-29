var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var DealSchema = new Schema({
  description: String,
  timestamp: Number,
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

  return {
    raw: this.timestamp,
    valueText: (now.getDay() > dealTime.getDay() ? 'Hier à ' : 'Aujourd\'hui à ' ) + dealTime.getHours() + 'h' + dealTime.getMinutes(),
    differenceText: 'Il y a ' + (diff.hour >= 1 ? diff.hour + 'h' : '') + (diff.min > 0 ? diff.min : '') + (diff.hour >= 1 ? '' : 'mn')
  };

};

module.exports = mongoose.model('Deal', DealSchema);