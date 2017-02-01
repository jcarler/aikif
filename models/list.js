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
    .populate({
      path: 'merchant',
      model: 'Merchant',
      populate: {
        path: 'category',
        model: 'Category'
      }
    });
};

ListSchema.statics.getById = function (id) {
  return this
    .findById(id)
    .populate({
      path: 'merchant',
      model: 'Merchant',
      populate: {
        path: 'category',
        model: 'Category'
      }
    });
};

module.exports = mongoose.model('List', ListSchema);