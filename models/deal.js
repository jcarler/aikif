
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DealSchema   = new Schema({
  name: String,
  description: String,
  timestamp: Number,
  imageLink: String,
  merchant: {type: ObjectId, ref: 'Merchant'}
});

module.exports = mongoose.model('Deal', DealSchema);