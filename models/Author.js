const db = require('../database/connection');
const mongoose = db.mongoose;
const schema = mongoose.Schema;

let Author = new schema({
    name: String,
    age: Number
});

module.exports = mongoose.model( 'Author', Author );