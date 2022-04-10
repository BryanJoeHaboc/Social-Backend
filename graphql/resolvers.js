const bcrypt = require("bcrypt");
const validator = require("validator");

const User = require("../models/user.model");
const Post = require("../models/post.model");
const jwt = require("jsonwebtoken");

const validateEmailAndPassword = (errors, { email, password }) => {
  if (!validator.isEmail(email)) {
    errors.push({ message: "E-mail is invalid." });
  }

  if (
    validator.isEmpty(password) ||
    !validator.isLength(password, { min: 5 })
  ) {
    errors.push({ message: "Password too short!" });
  }
};

const validateCreatePost = (errors, { title, content, imageUrl }) => {
  if (validator.isEmpty(title)) {
    errors.push({ message: "Title must not be empty " });
  }

  if (validator.isEmpty(content)) {
    errors.push({ message: "Content must not be empty " });
  }

  if (validator.isURL(imageUrl)) {
    errors.push({ message: "Image Url must be a valid url" });
  }
};

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];

    validateEmailAndPassword(errors, userInput);

    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const { email, password, name } = userInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists!");
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const createdUser = await user.save();

    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ userInput }, req) {
    const { email, password } = userInput;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 404;
      throw error;
    }

    const isPasswordEqual = bcrypt.compare(password, user.password);

    if (!isPasswordEqual) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { userId: user._id.toString(), token };
  },
  createPost: async function ({ userInput }, req) {
    const errors = [];
    validateCreatePost(errors, userInput);

    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const post = new Post({
      title,
      content,
      creator: req.userId,
      imageUrl,
    });

    await post.save();

    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    return {
      post,
      creator: user,
    };
  },
  getPosts: async function ({ userInput }, req) {
    const page = req.query.page || 1;
    const perPage = 2;
    const offset = perPage * (page - 1);

    let totalItems = await Post.count();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(perPage);

    if (!posts) {
      const error = new Error("Could not find any post");
      error.statusCode = 404;
      throw error;
    }

    return { posts, totalItems };
  },
};
