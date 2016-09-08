var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var MerchantSchema = new Schema({
  name: String,
  pseudo: String,
  category: [{type: ObjectId, ref: 'Category'}],
  phone: String,
  email: String,
  adress: String,
  city: String,
  location: {
    'type': {
      type: String,
      enum: "Point",
      default: "Point"
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  moojPhone: String,
  moojMail: String,
  imageLink: String,
  company: {type: ObjectId, ref: 'Company'}
});

MerchantSchema.index({location: '2dsphere'});

module.exports = mongoose.model('Merchant', MerchantSchema);