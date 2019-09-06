# A feature rich GraphQL Express server

This solution uses [PosgreSQL](https://www.postgresql.org/) for persistence of data.

## Features
* Express powered Apollo Server
* PostgreSQL connectivity via Sequelize
* Multiple queries and mutations
* Subscriptions for real-time communication
* PostgreSQL linked resolvers
* Schema documentation via GraphiQL
* Custom validation and error handling
* User registration and token based authentication
* User authorisation via resolver middleware
* Custom scalars
* Cursor-based pagination
* E2E testing
* Batching and caching

## Prerequisites

As PostgreSQL maintains the persistence of data, you will need to create a `.env` file in order to connect to your database.

The `.env` file should look something like this:

```
DATABASE=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
HOST=localhost

SECRET=myverysecuresecretphrase
```

and must be placed in the root of this repository.

```
* src/
* node_modules/
.babelrc
-----------  .env  -----------
.gitattributes
.gitignore
README.md
package-lock.json
package.json
```

## Available Schemas

> **NOTE**: A `secret` is passed to all resolver functions. Some of these queries and/ or mutations require a `secret` to be defined. It can be added as a `SECRET` parameter in your `.env` file - to be used as an environment variable via the `dotenv` dependency. See the [Prerequisites](#Prerequisites) section for more info.


### Users

#### List all users
```graphql
{
    users {
        id
        username
        email
        messages {
            id
            text
            createdAt
        }
    }
}
```

#### List a specific user by user ID
```graphql
{
    user(id: 4) {
        id
        username
        email
    }
}
```

#### Sign Up 
```graphql
mutation {
    signUp(username: "TestUser", email: "user@email.com", password: "password123") {
        token
    }
}
```

#### Sign In 
```graphql
mutation {
    signIn(login: "TestUser", password: "password123") {
        token
    }
}
```

#### Show the 'me' user
```graphql
{
    me {
        id
        username
        email
        messages {
            id
            text
            createdAt
        }
    }
}
```

#### Delete user

> **NOTE**: To use this mutation, the user is required to `signIn` with an account that has the `role` of `ADMIN`.

```graphql
mutation {
  deleteUser(id: "2")
}
```


### Messages

#### List all messages

> **NOTE**: This particular example uses cursor based pagination on the `createdAt` field. It will retrieve the earliest created messages. 

```graphql
{
    messages(limit: 2) {
        edges {
            id
            text
            createdAt
        }
        pageInfo {
            hasNextPage
            endCursor
        } 
    }
  
    messages(limit: 1, cursor: "RnJpIFNlcCAwNiAyMDE5IDEyOjM0OjE5IEdNVCswMTAwIChCcml0aXNoIFN1bW1lciBUaW1lKQ==") {
        edges {
            id
            text
            createdAt
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}
```

#### List a specific message by message ID
```graphql
{
    message(id: "2") {
        id
        text
        createdAt
        user {
            id
            username
            email
        }
    }
}
```

#### Create a new message

> **NOTE**: At the moment, this mutation requires a 'me' `User` object to exit in `src/index.js` - as a `User` must exist for a `Message` object to be created.

```graphql
mutation {
    createMessage(text: "Cake") {
        id
        text
        createdAt
    }
}
```
#### Delete a specific message by message ID

```graphql
mutation {
    deleteMessage(id: "4")
}
```

### Subscriptions

#### Message Created

```graphql
subscription {
    messageCreated {
        message {
            id
            text
            createdAt
            user {
                id
                username
            }
        }
    }
}
```

## Run the application

Install dependencies:

    npm i

Start server: 

> **NOTE**: Make sure PostgreSQL is running before you start the application.

    npm start

Access GraphiQL at:
http://localhost:8000/graphiql