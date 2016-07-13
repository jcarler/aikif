
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MerchantSchema   = new Schema({
  name: String,
  location: String,
  type: String,
  imageLink: String
});

module.exports = mongoose.model('Merchant', MerchantSchema);