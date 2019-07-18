const _ = require("lodash");

//GraphQL Packages
var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLInt
} = require("graphql");

const dbConnect = db.connection;

/*dummy data starts here*/
var books = [
  {name: 'Justice on Trial', id: '1', authorId: '1'},
  {name: 'The Pioneer Woman Cooks', id:'2', authorId:'2'},
  {name: 'The Very Hungry Caterpillar', id:'3', authorId:'3'},
  {name: 'The Pigeon HAS to Go to School', id:'4', authorId:'3'},
  {name: 'Becoming Michelle Obama', id:'5', authorId:'4'},
  {name: 'The Alchemist', id:'6', authorId:'5'},
  {name: 'Chasing Light', id:'7', authorId:'4'},
  {name: 'My Historia', id:'8', authorId:'4'},
  {name: 'Devenir', id:'9', authorId:'4'},
  {name: 'Becoming: A minha historia', id:'10', authorId:'4'}
];

var authors = [
  {name: 'Mollie Hemingway', age: 45, authorId: '1'},
  {name: 'Ree Drummond', age: 50, authorId:'2'},
  {name: 'Eric Carle', age: 90, authorId:'3'},
  {name: 'Michelle Obama', age: 55, authorId:'4'},
  {name: 'Paulo Coelho', age: 71, authorId:'5'}
];
let books = Book.find({});
let authors = Author.find({});
/*dummy data ends here*/


//Book Data Model type
var BookType = new GraphQLObjectType({
  name:'Book',
  fields:() => ({
      name: {type: GraphQLString},
      id  : {type: GraphQLID},
      author: {
        type: AuthorType,
        resolve( parent, args ){
           return _.find( authors, {authorId: parent.authorId} );
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
          return _.filter( books, {authorId: parent.authorId} );
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
            return _.find( books, {id: args.id } );
          }

          if( args.name ){
              var pattern = _.lowerCase( args.name );
              return books.find( function( book ){
                  return ( book.name.toLowerCase().includes(pattern) === true ) ? book : null;
              });
          }

        }
      },
      books:{
         type: new GraphQLList( BookType ),
         args: {name: {type: GraphQLString}},
         resolve( parent, args ){
            if( args.name ){
              var pattern = _.lowerCase( args.name );
              return books.filter( function( book ){
                  return ( book.name.toLowerCase().includes(pattern) === true ) ? book : null;
              });
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
              return _.find( authors, {name: args.name} );
            }
            return _.find( authors, {authorId: args.id} );

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
          type: GraphQLString
        },
        age: {
          type: GraphQLInt
        }
      },
      resolve( parent, args ){
         console.log("Add author");
      }
    },
    addBook:{
      type: BookType,
      args:{
        name: {
          type: GraphQLString
        },
        authorId: {
          type: GraphQLID,
          require: true
        }
      },
      resolve( parent, args ){
         console.log("Add book");
        //  let newBook = new Book({
        //     name: args.name,
        //     authorId: args.authorId
        //  });

        //  return newBook.save();
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
