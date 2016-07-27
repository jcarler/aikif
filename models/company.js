var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
  name: String,
  pseudo: String,
  category: [String],
  phone: String,
  email: String,
  adress: String,
  city: String,
  location: String,
  moojPhone: String,
  moomMail: String,
  imageLink: String
});

module.exports = mongoose.model('Company', CompanySchema);