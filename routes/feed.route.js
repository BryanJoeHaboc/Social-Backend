const express = require("express");

const isAuth = require("../middlewares/authentication/is-auth");
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
router.get("/posts", isAuth, getPosts);

// GET single post
router.get("/post/:postId", isAuth, getPost);

// POST /feed/post
router.post("/post/", isAuth, postCreatePost, createPost);

// PUT /feed/post
router.put("/post/:postId", isAuth, postCreatePost, editPost);

router.delete("/post/:postId", isAuth, deletePost);

module.exports = router;
