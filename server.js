const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

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
