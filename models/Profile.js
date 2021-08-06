const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
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
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  profilepic: {
      type: String,
      required: true
  },
  prefered: {
    type: String,
      required: true
  },
  plateno: {
    type: String,
      required: true
  },
  idproof: {
    type: String,
      required: true
  }
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
