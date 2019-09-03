import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';

const app = express();

app.use(cors()); // enable cors

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        models,
        me: models.users[1],
    },
});

server.applyMiddleware({ app, path: '/graphiql' });

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on: http://localhost:8000/graphiql');
});