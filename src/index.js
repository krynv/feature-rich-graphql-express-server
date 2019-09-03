import express from 'express';
import cors from 'cors';
import { ApolloServer, gql } from 'apollo-server-express';
import uuidv4 from 'uuid/v4';

const app = express();
app.use(cors()); // enable cors

const schema = gql`
  type Query {
    users: [User!]
    me: User
    user(id: ID!): User

    messages: [Message!]!
    message(id: ID!): Message!
  }

  type User {
    id: ID!
    username: String!
    messages: [Message!]
  }

  type Message {
      id: ID!
      text: String!
      user: User!
  }

  # mutations

  type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
  }
`;

let messages = {
    1: {
        id: '1',
        text: 'Hello World',
        userId: '1',
    },
    2: {
        id: '2',
        text: 'Bye World',
        userId: '2',
    },
};

let users = {
    1: {
        id: '1',
        username: 'John Appleseed',
        messageIds: [1],
    },
    2: {
        id: '2',
        username: 'Chuck Norris',
        messageIds: [2],
    },
};

const resolvers = {

    // query resolvers
    Query: {

        // users
        users: () => {
            return Object.values(users);
        },

        user: (parent, { id }) => {
            return users[id];
        },

        // me
        me: (parent, args, { me }) => {
            return me;
        },

        // messages
        messages: () => {
            return Object.values(messages);
        },

        message: (parent, { id }) => {
            return messages[id];
        },
    },

    // message resolvers
    Message: {
        user: message => {
            return users[message.userId];
        },
    },

    // user resolvers
    User: {
        messages: user => {
            return Object.values(messages).filter(
                message => message.userId === user.id,
            );
        },
    },

    // mutations
    Mutation: {
        createMessage: (parent, { text }, { me }) => {

            const id = uuidv4();

            const message = {
                id,
                text,
                userId: me.id,
            };

            messages[id] = message;
            users[me.id].messageIds.push(id);

            return message;
        },

        deleteMessage: (parent, { id }) => {
            const { [id]: message, ...otherMessages } = messages;
            
            if (!message) {
                return false;
            }
            messages = otherMessages;

            return true;
        },
    },
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        me: users[1],
    },
});

server.applyMiddleware({ app, path: '/graphiql' });

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on: http://localhost:8000/graphiql');
});