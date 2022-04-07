const express = require("express");

const { getPosts, createPost } = require("../controllers/feed.controller");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("hello world");
});

// GET /feed/posts
router.get("/posts", getPosts);

// POST /feed/post
router.post("/post", createPost);

module.exports = router;
