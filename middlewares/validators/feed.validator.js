const { body } = require("express-validator");

const postCreatePost = [
  body("title").trim().isLength({ min: 5 }),
  body("content").trim().isLength({ min: 5 }),
];

module.exports = {
  postCreatePost,
};
