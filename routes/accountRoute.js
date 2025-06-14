const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require ("../utilities/index")
const regValidate = require('../utilities/account-validation')


// Default route attached to "/account"
router.get('/', utilities.checkLogin, accountController.getAccountManagementView);

// Route to login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to post registration form
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request using validation and controller logic
// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
