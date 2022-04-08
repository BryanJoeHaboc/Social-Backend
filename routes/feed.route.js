const express = require("express");
const { postCreatePost } = require("../middlewares/validators/feed.validator");
const {
  getPosts,
  createPost,
  getPost,
  editPost,
  deletePost,
} = require("../controllers/feed.controller");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("hello world");
});

// GET /feed/posts
router.get("/posts", getPosts);

// GET single post
router.get("/post/:postId", getPost);

// POST /feed/post
router.post("/post/", postCreatePost, createPost);

// PUT /feed/post
router.put("/post/:postId", postCreatePost, editPost);

router.delete("/post/:postId", deletePost);

module.exports = router;
