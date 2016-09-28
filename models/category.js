var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  displayName: String,
  code: String,
  color: String
});

module.exports = mongoose.model('Category', CategorySchema);