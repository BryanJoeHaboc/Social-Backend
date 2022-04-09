const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

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

    throw error;
  }
};

// ---------------------------------------------- CONTROLLERS -------------------------------------------

const getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 2;
  const offset = perPage * (page - 1);

  try {
    let totalItems = await Post.count();
    const posts = await Post.find().skip(offset).limit(perPage);

    if (!posts) {
      const error = new Error("Could not find any post");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json({ message: "fetched post successfully", posts, totalItems });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const createPost = async (req, res, next) => {
  try {
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
      creator: req.userId,
      imageUrl,
    });

    const savedPost = await post.save();

    if (savedPost) {
      const user = await User.findById(req.userId);
      user.posts.push(post);
      const savedUser = await user.save();
      if (savedUser) {
        res.status(201).json({
          message: "Post created successfully!",
          post,
          creator: { _id: user._id, name: user.name },
        });
      }
    } else {
      throw new Error("Server error. Please try again");
    }
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: "fetched post", post });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const editPost = async (req, res, next) => {
  try {
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

    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Could not find post.");
      error.statusCode = 400;
      throw error;
    }

    if (imageUrl !== post.imageUrl) clearImage(post.imageUrl);

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const result = await post.save();

    if (!result) {
      throw new Error("Server error. Please try again");
    }

    res
      .status(200)
      .send({ message: "Post successfully updated", post: result });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Could not find post.");
      error.statusCode = 400;
      throw error;
    }

    clearImage(post.imageUrl);
    const isPostDeleted = await Post.findByIdAndRemove(postId);

    if (isPostDeleted) {
      const currentUser = await User.findById(req.userId);
      if (!currentUser) {
        const error = new Error("User does not exists.");
        error.statusCode = 401;
        throw error;
      }
      currentUser.posts.pull(postId);
      await currentUser.save();
      res.status(200).json({ message: "Post deleted" });
    } else {
      const error = new Error("Post not found");
      error.statusCode(404);
      throw error;
    }
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
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
