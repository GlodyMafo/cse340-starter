const utilities = require("./index");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");

const validate = {};

/* Registration Data Validation Rules */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* Login Data Validation Rules */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* Check registration data and return errors or continue */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    });
    return;
  }
  next();
};

/* Check login data and return errors or continue */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email: req.body.account_email,
    });
    return;
  }
  next();
};

/* Account Update Validation */
validate.accountUpdateRules = () => {
  return [
    body("firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required"),
    body("lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .custom(async (email, { req }) => {
        const accountId = req.body.account_id;
        const existingAccount = await accountModel.getAccountByEmail(email);
        if (existingAccount && existingAccount.account_id != accountId) {
          throw new Error("Email already in use");
        }
      }),
  ];
};

validate.checkAccountUpdate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("accounts/update", {
      errors: errors.array(),
      account: req.body,
      message: null,
    });
  }
  next();
};

/* Password Change Validation */
validate.passwordChangeRules = () => {
  return [
    body("password")
      .optional({ checkFalsy: true })
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[0-9]/)
      .withMessage("Password must contain a number")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain a letter"),
  ];
};

validate.checkPasswordChange = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("accounts/update", {
      errors: errors.array(),
      account: { account_id: req.body.account_id },
      message: null,
    });
  }
  next();
};

module.exports = validate;
