var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var masterListSchema = new Schema({
  word: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now()
  }
});

var MasterList = mongoose.model('MasterList', masterListSchema);
module.exports = MasterList;