var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
  name: String,
  pseudo: String,
  category: String,
  phone: Number,
  email: String,
  adress: String,
  city: String,
  location: String,
  moojPhone: Number,
  moomMail: Number,
  imageLink: String
});

module.exports = mongoose.model('Company', CompanySchema);