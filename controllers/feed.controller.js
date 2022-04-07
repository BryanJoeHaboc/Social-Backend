const { validationResult } = require("express-validator");
const Post = require("../models/post.model");

const getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/duck.jpg",
        creator: {
          name: "Maximilian",
        },
        createdAt: new Date(),
      },
    ],
  });
};
const createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect. Please try again",
      errors: errors.array(),
    });
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = "images/duck.jpg";

  // Create post in db
  const post = new Post({
    title,
    content,
    creator: { name: "BryanJoe" },
    imageUrl,
  });

  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => console.log(err));
};

module.exports = {
  createPost,
  getPosts,
};
