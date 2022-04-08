const { validationResult } = require("express-validator");
const Post = require("../models/post.model");
const path = require("path");
const fs = require("fs");

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

    throw error;
  }
};

const getPosts = (req, res, next) => {
  const page = req.query.page || 1;

  const perPage = 2;
  const offset = perPage * (page - 1);
  let totalItems = 0;

  Post.count()
    .then((countOfAllItems) => {
      totalItems = countOfAllItems;
      return Post.find().skip(offset).limit(perPage);
    })
    .then((posts) => {
      if (!posts) {
        const error = new Error("Could not find any post");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: "fetched post successfully", posts, totalItems });
    });
};

const createPost = (req, res, next) => {
  validateError(req);

  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");

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

const editPost = (req, res, next) => {
  validateError(req);

  const postId = req.params.postId;
  const { title, content } = req.body;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  if (!imageUrl) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }

      if (imageUrl !== post.imageUrl) clearImage(post.imageUrl);

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((result) => {
      res
        .status(200)
        .send({ message: "Post successfully updated", post: result });
    })
    .catch((err) => {
      passToErrorMiddleware(err, next);
    });
};

const deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      res.status(200).json({ message: "Post deleted" });
    })
    .catch((err) => {
      passToErrorMiddleware(err, next);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  editPost,
  deletePost,
};
