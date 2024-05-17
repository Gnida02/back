const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL

mongoose
  .connect('mongodb://0.0.0.0:27017/dental', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(function(err) {
    throw Error(err);
  });

module.exports = mongoose;