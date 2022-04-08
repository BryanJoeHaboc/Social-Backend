const express = require("express");

const {
  signup,
  login,
  getStatus,
  updateUserStatus,
} = require("../controllers/auth.controller");
const isAuth = require("../middlewares/authentication/is-auth");

const {
  validateUserInput,
  validateStatus,
} = require("../middlewares/validators/auth.validator");

const router = express.Router();

router.post("/signup", validateUserInput, signup);

router.post("/login", login);

router.get("/status", isAuth, getStatus);

router.patch("/status", isAuth, validateStatus, updateUserStatus);

module.exports = router;
