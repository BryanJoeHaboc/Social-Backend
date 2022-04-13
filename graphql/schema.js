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

    type Posts {
        posts: [Post!]!
        totalItems: Int!
    }

    type DeletedPostConfirmation{
        message: String!
    }

    type UserStatus {
        status: String!
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

    input PostInput {
        title: String!
        content: String!
        imageUrl: String!
    }


    type RootMutation {
        createUser(userInput: UserInputData) : User!
        createPost(userInput: PostInput ) : Post!
        editPost(userInput: PostInput, postId: ID!) : Post!
        deletePost(postId: ID!) : DeletedPostConfirmation!
    }

    type RootQuery{
        login(userInput: UserInputDataLogin): Auth!
        getPosts(page: Int ): Posts!
        getSinglePost(postId : ID!) : Post! 
        getStatus : UserStatus!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
