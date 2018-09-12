const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/** 接続URL */
const url = 'mongodb://localhost:27017';

/** データベース名 */
const dbName = 'myDB';

/** Create */
const insertDocuments = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** collectionにdocumentを追加 */
  collection.insertMany(
    [{ name: 'Dan', age: 18 }, { name: 'Bob', age: 22 }, { name: 'John', age: 30 }],
    (err, result) => {
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      console.log('Inserted 3 documents into the collection');
    },
  );
};

/** Read */
const findDocuments = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを検索（ageが20以上のdocumentのnameを取得） */
  collection
    .find({})
    .project({ name: 1 })
    .toArray((err, docs) => {
      assert.equal(err, null);
      console.log('Found the following records');
      console.log(docs);
    });
};

/** Update */
const updateDocument = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを更新（ageが19以下のdocumentに{ status: false }を追加） */
  collection.updateMany({ age: { $lt: 20 } }, { $set: { status: false } }, (err, result) => {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Updated the document with the field a equal to 2');
  });
};

/** Delete */
const removeDocument = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを削除（statusがfalseのdocuentを削除） */
  collection.deleteMany({ status: false }, (err, result) => {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Removed the document with the field a equal to 3');
  });
};

/** indexes */
const indexCollection = (db) => {
  db.collection('myCollection').createIndex({ name: 1 }, null, (err, results) => {});
};

(async function() {
  let client;

  try {
    /** DBサーバーに接続 */
    client = await MongoClient.connect(
      url,
      { useNewUrlParser: true },
    );
    /** DBを取得 */
    const db = client.db(dbName);

    await insertDocuments(db);
    await indexCollection(db);
    await updateDocument(db);
    await findDocuments(db);
    await removeDocument(db);
    await findDocuments(db);
  } catch (err) {
    console.log(err.stack);
  }

  /** DBサーバーとの接続解除 */
  client.close();
})();

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
