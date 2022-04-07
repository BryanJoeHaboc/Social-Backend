const express = require("express");
const { postCreatePost } = require("../middlewares/validators/feed.validator");
const { getPosts, createPost } = require("../controllers/feed.controller");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("hello world");
});

// GET /feed/posts
router.get("/posts", getPosts);

// POST /feed/post
router.post("/post", postCreatePost, createPost);

module.exports = router;
