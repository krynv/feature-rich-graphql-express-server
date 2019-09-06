import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessageOwner } from './authorisation';
import Sequelize from 'sequelize';
import pubsub, { EVENTS } from '../subscription';

const toCursorHash = string => Buffer.from(string).toString('base64');
const fromCursorHash = string => Buffer.from(string, 'base64').toString('ascii');

export default {

    Query: {
        messages: async (parent, { cursor, limit = 100 }, { models }) => {

            const cursorOptions = cursor ? {
                where: {
                    createdAt: {
                        [Sequelize.Op.lt]: fromCursorHash(cursor), // using the date as a cursor (for pagination) where the messages are before the date specified
                    }
                }
            } : {};

            const messages = await models.Message.findAll({
                order: [['createdAt', 'DESC']], // order it by the date created 
                limit: limit + 1,
                ...cursorOptions, // pass in our cursor options
            });

            const hasNextPage = messages.length > limit;
            const edges = hasNextPage ? messages.slice(0, -1) : messages;

            return {
                edges,
                pageInfo: { // we can use the last message as the end cursor for our pagination
                    hasNextPage, // and here, we can see if there is a next page or not
                    endCursor: toCursorHash(
                        edges[edges.length - 1].createdAt.toString(), // this means we don't have to query every createdAt date of every message
                    ),
                }
            };
        },

        message: async (parent, { id }, { models }) => {
            return await models.Message.findByPk(id);
        },
    },

    Mutation: {
        createMessage: combineResolvers(isAuthenticated, async (parent, { text }, { models, me }) => {
            const message = await models.Message.create({
                text,
                userId: me.id,
            });

            pubsub.publish(EVENTS.MESSAGE.CREATED, {
                messageCreated: { message },
            });

            return message;
        }),

        deleteMessage: combineResolvers(isAuthenticated, isMessageOwner, async (parent, { id }, { models }) => {
            return await models.Message.destroy({ where: { id } });
        }),

    },

    Message: {
        user: async (message, args, { loaders }) => {
            return await loaders.user.load(message.userId);
        },
    },

    Subscription: {
        messageCreated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
        },
    },
};

