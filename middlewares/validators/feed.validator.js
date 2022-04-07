const { body } = require("express-validator");

const postCreatePost = (req, res, next) => {
  body("title").trim().isLength({ min: 5 });
  body("content").trim().isLength({ min: 5 });

  next();
};

module.exports = {
  postCreatePost,
};
