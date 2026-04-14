const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true // Ensures you can't have two 'admin1's
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'Admin' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);