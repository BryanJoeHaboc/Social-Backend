const express = require("express");

const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("hello world");
});

// GET /feed/posts
router.get("/posts", feedController.getPosts);

// POST /feed/post
router.post("/post", feedController.createPost);

module.exports = router;
