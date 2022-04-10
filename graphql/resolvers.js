const User = require("../models/user.model");
const bcrypt = require("bcrypt");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const { email, password, name } = userInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists!");
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const createdUser = await user.save();

    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
};
