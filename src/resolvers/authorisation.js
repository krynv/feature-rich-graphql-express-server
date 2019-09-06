import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) =>
    me ? skip : new ForbiddenError('You are not a valid user.');

export const isMessageOwner = async (parent, { id }, { models, me }) => {
    const message = await models.Message.findByPk(id, { raw: true });

    if (message.userId !== me.id) {
        throw new ForbiddenError('You are not the owner of this message.');
    }

    return skip;
};

export const isAdmin = combineResolvers(isAuthenticated, (parent, args, { me: { role } }) =>
    role === 'ADMIN' ? skip : new ForbiddenError('You do not have permission to access this command.'),
);