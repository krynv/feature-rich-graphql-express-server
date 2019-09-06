import express from 'express';
import cors from 'cors';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import http from 'http';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';


const app = express();
const eraseDatabaseOnSync = true;

const httpServer = http.createServer(app);
const isTest = !!process.env.TEST_DATABASE;


app.use(cors()); // enable cors

const server = new ApolloServer({
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
            };
        }

        if (req) {
            const me = await getMe(req);

            return {
                models,
                me,
                secret: process.env.SECRET,
            };
        }
    },
});

server.applyMiddleware({ app, path: '/graphql' });
server.installSubscriptionHandlers(httpServer);

sequelize.sync({ force: isTest }).then(async () => {
    if (isTest) {
        createUsersWithMessages(new Date());
    }

    httpServer.listen({ port: 8000 }, () => {
        console.log('Apollo Server on: http://localhost:8000/graphql');
    });
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

    if (token) {
        try {
            return await jwt.verify(token, process.env.SECRET);
        } catch (e) {
            throw new AuthenticationError(
                'Your session has expired. Please sign in again.',
            );
        }
    }
};