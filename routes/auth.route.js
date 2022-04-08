const express = require("express");

const { signup, login } = require("../controllers/auth.controller");

const {
  validateUserInput,
} = require("../middlewares/validators/auth.validator");

const router = express.Router();

router.post("/signup", validateUserInput, signup);

router.post("/login", login);

module.exports = router;
