const { User, Book } = require('../models');
const {signToken} = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = User.findOne({})
        .select('__v -password')
        .populate('books')
        return userData;
      }
      throw new AuthenticationError("Log in first!")
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
        const user = User.create(args);
        console.log(user)
        const token = signToken(user);
        return {token, user};
    },
    login: async (parent, {email, password}) => {
        const user = await User.findOne({ email });

        if (!user) {
            throw new AuthenticationError("No user found!");
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw new AuthenticationError('Bad Credentials');
        }

        const token = signToken(user);

        return {token};
    },
    saveBook: async (parent, {input}, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$addToSet: {savedBooks: input},},
                {new: true, runValidators: true}
            )

            return updatedUser
        }
        throw new AuthenticationError("Log In first!")
    },
    removeBook: async (parent, {bookId}, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$pull: {savedBooks: {bookId: bookId}}},
                {new: true}
            )
            return updatedUser
        }
        throw new AuthenticationError("Log in First!")
    }
  },
};

module.exports = resolvers;
