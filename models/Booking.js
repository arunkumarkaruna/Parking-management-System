const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  userEmailWhoBooked: {
    type: String,
  },
  userFirstNameWhoBooked: {
    type: String,
  },
  email: {
    type: String,
  },
 vno: {
    type: String,
  },
  timeflag: {
    type: String
  },
  time: {
    type: String,
  },
  starttime: {
    type: String,
  },
  endtime: {
    type: String,
  },
  area: {
    type: String,
  },
  paymentstatus: {
    type: Boolean,
    default: false
  },
  expirystatus: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number
  },
  createdAt: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
