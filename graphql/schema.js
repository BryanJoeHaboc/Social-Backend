const { buildSchema } = require("graphql");

module.exports = buildSchema(`

    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        password: String
        email: String!
        status: String!
        posts: [Post!]!
    }

    type Auth {
        token: String!
        userId: String!
    }

    input UserInputData {
        email: String!
        password: String!
        name: String!
    }

    input UserInputDataLogin {
        email: String!
        password: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData) : User!
    }

    type RootQuery{
        login(userInput: UserInputDataLogin): Auth!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
