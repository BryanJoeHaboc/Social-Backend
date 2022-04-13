const bcrypt = require("bcrypt");
const validator = require("validator");
const fs = require("fs");
const path = require("path");

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

  // if (!validator.isURL(imageUrl)) {
  //   errors.push({ message: "Image Url must be a valid url" });
  // }
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
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    //dummy url
    // if (!userInput.imageUrl)
    //   userInput.imageUrl =
    //     "https://images.pexels.com/photos/3358707/pexels-photo-3358707.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

    validateCreatePost(errors, userInput);

    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const { title, content, imageUrl } = userInput;
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("Invalid user");
      error.data = errors;
      error.code = 401;
      throw error;
    }

    const post = new Post({
      title,
      content,
      creator: user,
      imageUrl,
    });

    const createdPost = await post.save();

    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  getPosts: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }
    if (!page) page = 1;

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

    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalItems,
    };
  },
  getSinglePost: async function ({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  getStatus: async function ({ userId }, req) {
    const errors = [];

    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      const error = new Error("Invalid user");
      error.data = errors;
      error.code = 401;
      throw error;
    }
    return {
      status: currentUser.status,
    };
  },
  editPost: async function ({ userInput, postId }, req) {
    const errors = [];

    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }

    validateCreatePost(errors, userInput);

    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Could not find post.");
      error.statusCode = 400;
      throw error;
    }
    const { title, content } = userInput;
    let imageUrl = userInput.imageUrl;

    post.title = title;
    post.content = content;
    if (imageUrl !== "undefined") {
      post.imageUrl = imageUrl;
    }

    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
  deletePost: async function ({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
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

      return {
        message: "Successfully deleted",
      };
    } else {
      const error = new Error("Post not found");
      error.statusCode(404);
      throw error;
    }
  },
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401;
      throw error;
    }
    if (!status) {
      const error = new Error("Invalid User status");
      error.status = 422;
      throw error;
    }
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      const error = new Error("User does not exists.");
      error.statusCode = 401;
      throw error;
    }
    currentUser.status = status;
    await currentUser.save();

    return {
      status: currentUser.status,
    };
  },
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);

  fs.unlink(filePath, (err) => console.log(err));
};
