const { body } = require("express-validator");
const User = require("../../models/user.model");

const validateUserInput = [
  body("email")
    .trim()
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("User already exists");
        }
      });
    })
    .normalizeEmail(),
  body("name").trim().not().isEmpty(),
  body("password").trim().isLength({ min: 6 }),
];

const validateStatus = [body("status").not().isEmpty()];

module.exports = {
  validateUserInput,
  validateStatus,
};
