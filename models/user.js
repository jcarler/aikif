var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  name: String,
  following: [{type: ObjectId, ref: 'Merchant'}]
});

module.exports = mongoose.model('User', UserSchema);