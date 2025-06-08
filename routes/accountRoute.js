const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require ("../utilities/index")
const regValidate = require('../utilities/account-validation')

// Route to login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//Route to post registration form
// Process the registration data

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router