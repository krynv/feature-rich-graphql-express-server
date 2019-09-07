import express from 'express';
import cors from 'cors';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import http from 'http';
import DataLoader from 'dataloader';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import loaders from './loaders';


const app = express();
const port = process.env.PORT || 8000;

const httpServer = http.createServer(app);
const isTest = !!process.env.TEST_DATABASE;
const isProduction = !!process.env.DATABASE_URL;

const userLoader = new DataLoader(keys => loaders.user.batchUsers(keys, models)); // have to declare the loader here as it will not allow for caching in the context

const server = new ApolloServer({
    introspection: true,
    playground: true,
    typeDefs: schema,
    resolvers,
    formatError: error => {
        const message = error.message
            .replace('SequelizeValidationError: ', '')  // remove the internal sequelize message
            .replace('Validation error: ', '');         // leave the validation error we specified

        return {
            ...error,
            message,
        };
    },
    context: async ({ req, connection }) => {

        if (connection) {
            return {
                models,
                loaders: {
                    user: userLoader, // we can also use caching for subscriptions
                }
            };
        }

        if (req) {
            const me = await getMe(req);

            return {
                models,
                me,
                secret: process.env.SECRET,
                loaders: {
                    user: userLoader,
                },
            };
        }
    },
});

const createUsersWithMessages = async date => {

    await models.User.create(
        {
            username: 'jappleseed',
            email: 'jappleseed@apple.com',
            password: 'password',
            role: 'ADMIN',
            messages: [
                {
                    text: 'Created Apple',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
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
            email: 'chuck@norris.com',
            password: 'password',
            messages: [
                {
                    text: 'Counted to infinity. Twice',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
                {
                    text: 'Can speak braille',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        },
    );
};

const getMe = async req => {
    const token = req.headers['x-token'];

    if (token && token !== null) {
        try {
            return await jwt.verify(token, process.env.SECRET);
        } catch (e) {
            throw new AuthenticationError(
                'Your session has expired. Please sign in again.',
            );
        }
    }
};

app.use(cors()); // enable cors

server.applyMiddleware({ app, path: '/graphql' });
server.installSubscriptionHandlers(httpServer);

sequelize.sync({ force: isTest || isProduction }).then(async () => {
    if (isTest || isProduction) {
        createUsersWithMessages(new Date());
    }

    httpServer.listen({ port }, () => {
        console.log(`Apollo Server on: http://localhost:${port}/graphql`);
    });
});