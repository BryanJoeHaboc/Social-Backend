const express = require("express");

const { signup } = require("../controllers/auth.controller");

const {
  validateUserInput,
} = require("../middlewares/validators/auth.validator");

const router = express.Router();

router.post("/signup", validateUserInput, signup);

module.exports = router;
