const bcrypt = require("bcrypt");
const validator = require("validator");

const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const validateEmailAndPassword = (errors, { email, password }) => {
  if (!validator.isEmail(email)) {
    errors.push({ message: "E-mail is invalid." });
  }

  if (
    validator.isEmpty(password) ||
    !validator.isLength(password, { min: 5 })
  ) {
    errors.push({ message: "Password too short!" });
  }
};

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];

    validateEmailAndPassword(errors, userInput);

    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

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
  login: async function ({ userInput }, req) {
    const { email, password } = userInput;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 404;
      throw error;
    }

    const isPasswordEqual = bcrypt.compare(password, user.password);

    if (!isPasswordEqual) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { userId: user._id.toString(), token };
  },
};
