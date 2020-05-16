const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  content: String,
  answer: String,
})

mongoose.model('reviews', reviewSchema);