const express = require("express");
const graphqlHTTP = require("express-graphql");

const schema  = require("./schema/schema")
const app  = express();
const port = 4000;

app.use('/bookstore', graphqlHTTP({
   schema,
   graphiql: true
}));

app.listen(4000,() => {
  console.log("Application started");
});
