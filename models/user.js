var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  name: String,
  following: [{type: ObjectId, ref: 'Merchant'}]
});

UserSchema.statics.getAll = function () {
  return this
    .find({})
    .populate('following');
};

UserSchema.statics.getById = function (id) {
  return this
    .findById(id)
    .populate('following');
};

module.exports = mongoose.model('User', UserSchema);