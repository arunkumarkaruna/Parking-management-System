const mongoose = require('mongoose');

const SpotSchema = new mongoose.Schema({
 email: {
    type: String,
  },
  firstname: {
    type: String,
  },
  area: {
    type: String,
  },
  pic: {
    type: String,
  },
  capacity: {
    type: Number,
  },
  createdAt: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Spot = mongoose.model('Spot', SpotSchema);

module.exports = Spot;
