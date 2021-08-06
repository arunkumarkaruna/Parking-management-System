const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
 email: {
    type: String,
  },
  feedback: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;
