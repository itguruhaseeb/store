const _ = require("lodash");
const db = require('../database/connection');

//db.authors.insert({"_id": ObjectId("5d30865564a5c31039f44e1e"), "name": "Eric Carle", "age": 90})
//Models
const Author = require('../models/Author');
const Book   = require('../models/Book');

//GraphQL Packages
var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull
} = require("graphql");

const dbConnect = db.connection;

//Books and authors data
let books   = null;
let authors = null;

//Book Data Model type
var BookType = new GraphQLObjectType({
  name:'Book',
  fields:() => ({
      name: {type: GraphQLString},
      id  : {type: GraphQLID},
      author: {
        type: AuthorType,
        resolve( parent, args ){
           return Author.findById( parent.authorId );
        }
      }
  })
});

//Authors Data Model type
var AuthorType = new GraphQLObjectType({
  name: 'Author',
  fields:() => ({
     name: {type: GraphQLString},
     id: {type: GraphQLID},
     age: {type: GraphQLInt},
     books:{
       type: new GraphQLList( BookType ),
       resolve( parent, args ){
          return Book.find({authorId: parent.id});
       }
     }
  })
});


//Root Query
var RootQuery = new GraphQLObjectType({
   name: 'RootQueryType',
   fields:{
      book:{
        type: BookType,
        args: {id: {type: GraphQLID}, name: {type: GraphQLString}},
        resolve( parent, args ){
          if( args.id ){
            return Book.findById( args.id )
          }

          if( args.name ){
              return Book.find({name: args.name});
          }

        }
      },
      books:{
         type: new GraphQLList( BookType ),
         args: {name: {type: GraphQLString}},
         resolve( parent, args ){
            if( args.name ){
              return Book.find({name: {$regex: args.name, $options: 'i'}});
            }

            if( books === null ){
              books = Book.find({})
            }
            
            return books;
         }
      },
      authors:{
        type: new GraphQLList( AuthorType ),
        resolve( parent, args ){
          return Author.find({});
        }
      },
      author:{
        type: AuthorType,
        args: {id: {type: GraphQLID}, name:{type:GraphQLString}},
        resolve( parent, args ){
            if( args.name ){
              return Author.find( {"name": args.name} );
            }

            return Author.findById( args.id );
        }
      }
   }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addAuthor:{
      type: AuthorType,
      args:{
        name: {
          type: new GraphQLNonNull( GraphQLString )
        },
        age: {
          type: GraphQLInt
        }
      },
      resolve( parent, args ){
         console.log("Add author");
         let newAuthor = new Author({
            name: args.name,
            age: args.age
         });

         return newAuthor.save();
      }
    },
    addBook:{
      type: BookType,
      args:{
        name: {
          type: new GraphQLNonNull( GraphQLString )
        },
        authorId: {
          type: GraphQLID,
          require: true
        }
      },
      resolve( parent, args ){
         console.log("Add book");
         let newBook = new Book({
            name: args.name,
            authorId: args.authorId
         });

         return newBook.save();
      }
    },
    deleteBook:{
      type: BookType,
      args:{
        id:   {type: GraphQLID}
      },
      resolve( parent, args ){
        return Book.deleteOne({_id: args.id}, () =>{
            return { "msg": "Record removed" }
        });
      }
    },
    deleteAuthor:{
      type: AuthorType,
      args:{
        id: {
          type: GraphQLID
        }
      },
      resolve( parent, args ){
        return Book.deleteMany({authorId: args.id}, (err) => {
            return Author.deleteOne({_id: args.id}, (err) => {
                console.log("Records successfully deleted");
            });
        });
      }
    }

  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
