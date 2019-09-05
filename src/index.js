import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const app = express();
const eraseDatabaseOnSync = true;

app.use(cors()); // enable cors

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: async () => ({
        models,
        me: await models.User.findByLogin('cnorris'),
    }),
});

server.applyMiddleware({ app, path: '/graphiql' });

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsersWithMessages();
    }

    app.listen({ port: 8000 }, () => {
        console.log('Apollo Server on: http://localhost:8000/graphiql');
    });
});

const createUsersWithMessages = async () => {

    await models.User.create(
        {
            username: 'jappleseed',
            messages: [
                {
                    text: 'Created Apple',
                },
            ],
        },
        {
            include: [models.Message],
        },
    );

    await models.User.create(
        {
            username: 'cnorris',
            messages: [
                {
                    text: 'Counted to infinity. Twice',
                },
                {
                    text: 'Can speak braille',
                },
            ],
        },
        {
            include: [models.Message],
        },
    );
};