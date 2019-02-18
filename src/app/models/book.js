const mongoose = require('../../database');

const Schema = mongoose.Schema;
const DocumentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    isbn: { type: Number, required: true },
    language: { type: String, required: true },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', DocumentSchema);