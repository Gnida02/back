const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
    category: String,  
    name: String,
    price: Number,
  });
  
  const Service = mongoose.model('Service', ServiceSchema);

  module.exports = Service;