const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

/** Create */
const insertDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log('Inserted 3 documents into the collection');
    callback(result);
  });
};

/** Read */
const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    // collection.find({ a: 3 }).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log('Found the following records');
    console.log(docs);
    callback(docs);
  });
};

/** Update */
const updateDocument = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a: 2 }, { $set: { b: 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Updated the document with the field a equal to 2');
    callback(result);
  });
};

/** Delete */
const removeDocument = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Delete document where a is 3
  collection.deleteOne({ a: 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Removed the document with the field a equal to 3');
    callback(result);
  });
};

// Use connect method to connect to the server
MongoClient.connect(
  url,
  { useNewUrlParser: true },
  (err, client) => {
    assert.equal(null, err);
    console.log('Connected successfully to server');

    const db = client.db(dbName);

    insertDocuments(db, () => {
      updateDocument(db, () => {
        findDocuments(db, () => {
          removeDocument(db, () => {
            findDocuments(db, () => {
              client.close();
            });
          });
        });
      });
    });
  },
);

let data = require('./data.json');

const schema = buildSchema(`
  type Query {
    getUser(index: ID!): User
  }
  type Mutation {
    createUser(userInput: UserInput): User
  }
  type User {
    id: ID
    name: String
    age: Int
  }
  input UserInput {
    name: String
    age: Int
  }
`);

const root = {
  getUser(root) {
    return data[root.index];
  },
  createUser({ userInput }) {
    const id = String(Object.keys(data).length + 1);
    data = {
      ...data,
      [id]: {
        id,
        name: userInput.name,
        age: userInput.age,
      },
    };
    console.log(data);
  },
};

const app = express();
app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }),
);
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
