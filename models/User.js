const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  profileMode: {
    type: String,
    default: 'not-updated'
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
