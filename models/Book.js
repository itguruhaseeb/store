const db = require('../database/connection');
const mongoose = db.mongoose;
const schema = mongoose.Schema;

let Book = new schema({
    name: String,
    authorId: String
});

module.exports = mongoose.model( 'Book', Book );