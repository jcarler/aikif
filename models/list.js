var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ListSchema = new Schema({
  name: String,
  description: String,
  city: String,
  merchants: [{type: ObjectId, ref: 'Merchant'}],
  imageLink: String
});

ListSchema.statics.getAll = function () {
  return this
    .find({})
    .populate('merchants');
};

ListSchema.statics.getById = function (id) {
  return this
    .findById(id)
    .populate('merchants');
};

module.exports = mongoose.model('List', ListSchema);