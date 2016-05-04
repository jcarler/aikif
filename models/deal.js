
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DealSchema   = new Schema({
  name: String,
  description: String
});

module.exports = mongoose.model('Deal', DealSchema);