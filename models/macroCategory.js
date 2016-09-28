var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var macroCategorySchema = new Schema({
  displayName: String,
  code: String,
  categories: [{type: ObjectId, ref: 'Category'}]
});

module.exports = mongoose.model('macroCategory', macroCategorySchema);

