const { validationResult } = require("express-validator");

getPosts = (req, res, next) => {
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
createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message:
          "Validation failed, entered data is incorrect. Please try again",
        errors: errors.array(),
      });
  }

  const title = req.body.title;
  const content = req.body.content;
  console.log("title", content);
  // Create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: {
      id: new Date().toISOString(),
      title: title,
      content,
      creator: { name: "BryanJoe" },
      createdAt: new Date(),
    },
  });
};

module.exports = {
  createPost,
  getPosts,
};
