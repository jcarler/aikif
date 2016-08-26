
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var DealSchema   = new Schema({
  name: String,
  description: String,
  timestamp: Number,
  merchant: {type: ObjectId, ref: 'Merchant'},
  category: [String]
});

module.exports = mongoose.model('Deal', DealSchema);