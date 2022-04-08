require("dotenv").config();
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const Post = require("../models/post.model");

const passToErrorMiddleware = (err, next) => {
  console.log("err", err);
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

const signup = (req, res, next) => {
  validateError(req);

  const { email, password, name } = req.body;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        name,
        password: hashedPassword,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => passToErrorMiddleware(err));
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  let currentUser = {};

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        throwErrorIfUserDNE();
      }

      currentUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
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

      res.status(200).json({ token, userId: currentUser._id.toString() });
    })
    .catch((err) => passToErrorMiddleware(err));
};

const getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        throwErrorIfUserDNE();
      }

      res.status(200).json({ message: "User found", status: user.status });
    })
    .catch((err) => passToErrorMiddleware(err));
};

const updateUserStatus = (req, res, next) => {
  const { status } = req.body;
  console.log(status);

  if (!status) {
    const error = new Error("Invalid User status");
    error.status = 422;
    throw error;
  }

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        throwErrorIfUserDNE();
      }

      user.status = status;
      console.log(user);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Updated user status", status });
    })
    .catch((err) => passToErrorMiddleware(err));
};

module.exports = {
  signup,
  login,
  getStatus,
  updateUserStatus,
};
