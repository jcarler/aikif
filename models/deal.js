var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var DealSchema = new Schema({
  description: String,
  timestamp: Number,
  merchant: {type: ObjectId, ref: 'Merchant'}
});

DealSchema.statics.getById = function (id) {
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

module.exports = mongoose.model('Deal', DealSchema);