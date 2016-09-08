
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var DealSchema   = new Schema({
  description: String,
  timestamp: Number,
  merchant: {type: ObjectId, ref: 'Merchant'}
});

module.exports = mongoose.model('Deal', DealSchema);