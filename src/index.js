import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const app = express();

app.use(cors()); // enable cors

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        models,
    },
});

server.applyMiddleware({ app, path: '/graphiql' });

sequelize.sync().then(async () => {

    app.listen({ port: 8000 }, () => {
        console.log('Apollo Server on: http://localhost:8000/graphiql');
    });

});