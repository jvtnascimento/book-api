require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_URL || "mongodb://localhost/kotlin-book",  { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.set('createIndexes', true);

module.exports = mongoose;