// models/Result.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    required: true
  },
  preRollNo: {
    type: String,
    required: true
  },
  mainsRollNo: {
    type: String,
    default: ''
  },
  fullName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'MISSING GENDER'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  ph: {
    type: String,
    default: ''
  },
  exServiceman: {
    type: String,
    default: ''
  },
  preMarks: {
    type: String,
    required: true
  },
  mainsMarks: {
    type: String,
    default: null
  },
  treatedAs: {
    type: String,
    default: 'NA'
  }
});

module.exports = mongoose.model('Result', resultSchema);
