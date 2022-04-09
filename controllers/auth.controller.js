require("dotenv").config();
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const Post = require("../models/post.model");
const { getIO } = require("../socket");

const passToErrorMiddleware = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

const validateError = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation failed, entered data is incorrect. Please try again"
    );
    error.statusCode = 422;
    error.data = errors.array();

    throw error;
  }
};

const throwErrorIfUserDNE = () => {
  const error = new Error("User does not exists.");
  error.statusCode = 401;
  throw error;
};

// ---------------------------------------------- CONTROLLERS -------------------------------------------

const signup = async (req, res, next) => {
  const { email, password, name } = req.body;
  console.log(email, password, name);
  try {
    validateError(req);
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, name, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      throwErrorIfUserDNE();
    }
    const isPasswordCorrect = bcrypt.compare(password, currentUser.password);
    if (!isPasswordCorrect) {
      throwErrorIfUserDNE();
    }
    const token = jwt.sign(
      {
        email: currentUser.email,
        userId: currentUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      userId: currentUser._id.toString(),
    });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      throwErrorIfUserDNE();
    }
    res.status(200).json({ message: "User found", status: currentUser.status });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const updateUserStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    if (!status) {
      const error = new Error("Invalid User status");
      error.status = 422;
      throw error;
    }
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      throwErrorIfUserDNE();
    }
    currentUser.status = status;
    await currentUser.save();

    res.status(201).json({
      message: "User status updated successfully",
      status: result.status,
    });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

module.exports = {
  signup,
  login,
  getStatus,
  updateUserStatus,
};
