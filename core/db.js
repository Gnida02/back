const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(function(err) {
    throw Error(err);
  });

module.exports = mongoose;