const mongoose = require('mongoose');
let dbConnection = mongoose.connect('mongodb://localhost:27017/bookstore',{useNewUrlParser: true}, (err) => {
    
    if( err === undefined || err === null ){
        console.log( "Database is connected..." );
    }else{
        console.log( `Database connection error ::: ${err}` );
    }

});

module.exports = {connection: dbConnection, mongoose: mongoose};