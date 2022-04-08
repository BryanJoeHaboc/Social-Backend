const { validationResult } = require("express-validator");

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

const signup = (req, res, next) => {
  validateError(req);

  const { email, password, name } = req.body;
};

module.exports = {
  signup,
};
