# A feature rich GraphQL Express server

This solution uses [PosgreSQL](https://www.postgresql.org/) for persistence of data.

## Features
* Express powered Apollo Server
* Sequelize and PostgreSQL connectivity
* Multiple Queries and Mutations
* Resolvers powered by PostgreSQL
* Custom validation and error handling
* User authentication
* Schema documentation via GraphiQL

## Prerequisites

As PostgreSQL maintains the persistence of data, you will need to create a `.env` file in order to connect to your database.

The `.env` file should look something like this:

```
DATABASE=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
HOST=localhost
```

and must be placed in the root of this repository.

```
* src/
* node_modules/
.babelrc
-----------.env -----------
.gitattributes
.gitignore
README.md
package-lock.json
package.json
```

## Run the application

Install dependencies:

    npm i

Start server: 

> **NOTE**: Make sure PostgreSQL is running before you start the application.

    npm start

Access GraphiQL at:
http://localhost:8000/graphiql