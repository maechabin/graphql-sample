const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const data = require('./data.json');

const schema = buildSchema(`
  type Query {
    user(index: ID!): User
  }
  type User {
    id: ID
    name: String
  }
`);

const root = {
  user: (root) => data[root.index],
};

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }),
);
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
