import { expect } from 'chai';
import * as userApi from './api';

describe('users', () => {

    // log in
    describe('signIn(login: String!, password: String!): Token!', () => {
        it('returns a token when a user logs in with a valid username', async () => {
            const {
                data: {
                    data: {
                        signIn: { token },
                    },
                },
            } = await userApi.signIn({
                login: 'jappleseed',
                password: 'password',
            });

            expect(token).to.be.a('string');
        });

        // check we can log in with a valid email
        it('returns a token when a user logs in with a valid email', async () => {
            const {
                data: {
                    data: {
                        signIn: { token },
                    },
                },
            } = await userApi.signIn({
                login: 'jappleseed@apple.com',
                password: 'password',
            });

            expect(token).to.be.a('string');
        });

        // negative testing for incorrect password
        it('returns an error when a user provides an incorrect password', async () => {
            const {
                data: { errors },
            } = await userApi.signIn({
                login: 'jappleseed',
                password: 'meme123',
            });

            expect(errors[0].message).to.eql('Invalid password.');
        });

        // negative testing for a user not found
        it('returns an error when a user cannot be found', async () => {
            const {
                data: { errors },
            } = await userApi.signIn({
                login: 'tcook',
                password: 'password',
            });


            expect(errors[0].message).to.eql('No user found with these login credentials.');
        });

    });

    // display multiple users
    describe('users: [User!]', () => {
        it('returns a list of registered users', async () => {
            const expectedResult = {
                data: {
                    users: [
                        {
                            id: '1',
                            username: 'jappleseed',
                            email: 'jappleseed@apple.com',
                            role: 'ADMIN',
                        },
                        {
                            id: '2',
                            username: 'cnorris',
                            email: 'chuck@norris.com',
                            role: null,
                        },
                    ],
                },
            };

            const result = await userApi.users();

            expect(result.data).to.eql(expectedResult);
        });
    });

    // display single user
    describe('user(id: String!): User', () => {
        it('returns a user when a user can be found', async () => {

            const expectedResult = {
                data: {
                    user: {
                        id: '1',
                        username: 'jappleseed',
                        email: 'jappleseed@apple.com',
                        role: 'ADMIN',
                    },
                },
            };

            const result = await userApi.user({ id: '1' });

            expect(result.data).to.eql(expectedResult);
        });

        it('returns null when user cannot be found', async () => {

            const expectedResult = {
                data: {
                    user: null,
                },
            };
            const result = await userApi.user({ id: '42' });

            expect(result.data).to.eql(expectedResult);
        });
    });

    // check the 'me' user
    describe('me: User', () => {
        it('returns null when no user is signed in', async () => {
            const expectedResult = {
                data: {
                    me: null,
                },
            };

            const { data } = await userApi.me();

            expect(data).to.eql(expectedResult);
        });

        it('returns me when the me user is signed in', async () => {
            const expectedResult = {
                data: {
                    me: {
                        id: '1',
                        username: 'jappleseed',
                        email: 'jappleseed@apple.com',
                    },
                },
            };

            const {
                data: {
                    data: {
                        signIn: { token },
                    },
                },
            } = await userApi.signIn({
                login: 'jappleseed',
                password: 'password',
            });

            const { data } = await userApi.me(token);

            expect(data).to.eql(expectedResult);
        });
    });

    // delete a single user
    describe('deleteUser(id: String!): Boolean!', () => {
        it('returns an error because only ADMIN users can delete other users', async () => {
            const {
                data: {
                    data: {
                        signIn: {
                            token
                        }
                    }
                } } = await userApi.signIn({
                    login: 'cnorris',
                    password: 'password',
                });

            const { data: { errors } } = await userApi.deleteUser({ id: '1' }, token);

            expect(errors[0].message).to.eql('You do not have permission to access this command.');
        });
    });

    // negative testing for updating a user
    describe('updateUser(username: String!): User!', () => {
        it('returns an authentication error because only authenticated users can update a user', async () => {
            const {
                data: { errors },
            } = await userApi.updateUser({ username: 'SteveJobs' });

            expect(errors[0].message).to.eql('You are not a valid user.');
        });
    });


    // check that sign up, update user and delete user works
    describe('signUp, updateUser, deleteUser', () => {
        it('logs in as a user, updates the username and deletes the created user as an ADMIN', async () => {

            // sign up first
            let {
                data: {
                    data: {
                        signUp: { token },
                    },
                },
            } = await userApi.signUp({
                username: 'sjobs',
                email: 'sjobs@apple.com',
                password: 'password',
            });

            const {
                data: {
                    data: { me },
                },
            } = await userApi.me(token);

            expect(me).to.eql({ // check if we've signed in properly
                id: '3',
                username: 'sjobs',
                email: 'sjobs@apple.com',
            });

            // update our own details

            const {
                data: {
                    data: { updateUser },
                },
            } = await userApi.updateUser({ username: 'SteveJobs' }, token); // change the username

            expect(updateUser.username).to.eql('SteveJobs'); // check if it has worked

            // delete the user as an ADMIN user

            const {
                data: {
                    data: {
                        signIn: { token: adminToken },
                    },
                },
            } = await userApi.signIn({
                login: 'jappleseed',
                password: 'password',
            });

            const {
                data: {
                    data: { deleteUser },
                },
            } = await userApi.deleteUser({ id: me.id }, adminToken);

            expect(deleteUser).to.eql(true);
        });
    });


});