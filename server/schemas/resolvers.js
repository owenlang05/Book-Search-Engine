const { User, Book } = require('../models');
const AuthenticationError = require('../utils/auth')
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({_id: context.user._id})
      }
      throw AuthenticationError
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
        const user = User.create(args);
        return user;
    },
    login: async (parent, {email, password}) => {
        const user = await User.findOne({ email });

        if (!user) {
            throw AuthenticationError;
        }

        const correctPw = await user.verifyPassword(password);

        if (!correctPw) {
            throw AuthenticationError;
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
        throw AuthenticationError
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
        throw AuthenticationError
    }
  },
};

module.exports = resolvers;
