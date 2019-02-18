const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/kotlin-book",  { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.set('createIndexes', true);

module.exports = mongoose;