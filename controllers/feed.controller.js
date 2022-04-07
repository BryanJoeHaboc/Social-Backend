const { validationResult } = require("express-validator");
const Post = require("../models/post.model");

const passToErrorMiddleware = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

const getPosts = (req, res, next) => {
  Post.find().then((posts) => {
    if (!posts) {
      const error = new Error("Could not find any post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).send({ message: "fetched all post successfully", posts });
  });
};

const createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation failed, entered data is incorrect. Please try again"
    );
    error.statusCode = 422;

    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = "public/images/duck.jpg";

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
    .catch((err) => {
      passToErrorMiddleware(err, next);
    });
};

const getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ message: "fetched post", post });
    })
    .catch((err) => {
      passToErrorMiddleware(err, next);
    });
};

module.exports = {
  createPost,
  getPosts,
  getPost,
};
