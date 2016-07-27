var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var MerchantSchema = new Schema({
  name: String,
  pseudo: String,
  category: String,
  phone: String,
  email: String,
  adress: String,
  city: String,
  location: String,
  moojPhone: String,
  moojMail: String,
  imageLink: String,
  company: {type: ObjectId, ref: 'Company'}
});

module.exports = mongoose.model('Merchant', MerchantSchema);