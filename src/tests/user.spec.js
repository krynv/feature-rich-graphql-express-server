import { expect } from 'chai';
import * as userApi from './api';

describe('users', () => {
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
});