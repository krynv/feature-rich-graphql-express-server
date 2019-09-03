import express from 'express';
import cors from 'cors';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();
app.use(cors()); // enable cors

const schema = gql`
  type Query {
    me: User
    user(id: ID!): User
  }

  type User {
    id: ID!
    username: String!
  }

`;

let users = {
    1: {
        id: '1',
        username: 'John Appleseed',
    },
    2: {
        id: '2',
        username: 'Chuck Norris',
    },
};

const me = users[1];

const resolvers = {
    Query: {
        user: (parent, { id }) => {
            return users[id];
        },
        me: () => {
            return me;
        },
    },
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on: http://localhost:8000/graphql');
});