const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      console.log("Cookie JWT sent ✅")
      return res.redirect("/account/")
      
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }

}


async function getAccountManagementView (req, res) {
  // Assuming you use connect-flash or similar for flash messages
  const successMessages = req.flash('success');
  const errorMessages = req.flash('error');

  res.render('account/index', {
    messages: {
      success: successMessages.length ? successMessages[0] : null,
      error: errorMessages.length ? errorMessages[0] : null,
    }
  });
};


function showAccountManagement(req, res) {
  const user = res.locals.user; // from middleware

  res.render('accounts/manage', {
    firstname: user.firstname,
    accountType: user.accountType,
    accountId: user.accountId,
  });
}


async function showUpdateView(req, res) {
  try {
    const accountId = req.params.accountId;
    const account = await accountModel.getAccountById(accountId);
    if (!account) {
      return res.redirect('/accounts/manage');
    }
    res.render('accounts/update', { account, errors: [], message: null });
  } catch (error) {
    res.status(500).send('Server error');
  }
}

async function updateAccountInfo(req, res) {
  const { account_id, firstname, lastname, email } = req.body;

  try {
    const updateResult = await accountModel.updateAccountInfo(account_id, firstname, lastname, email);
    let message = updateResult ? 'Account updated successfully' : 'Account update failed';

    // fetch updated account info for display in manage view
    const account = await accountModel.getAccountById(account_id);

    res.render('accounts/manage', {
      firstname: account.firstname,
      accountType: account.accountType,
      accountId: account.account_id,
      message,
    });
  } catch (error) {
    res.render('accounts/update', {
      errors: [{ msg: 'Failed to update account info' }],
      account: req.body,
      message: null,
    });
  }
}

async function changePassword(req, res) {
  const { account_id, password } = req.body;

  if (!password) {
    return res.render('accounts/update', {
      errors: [{ msg: 'Password is required' }],
      account: { account_id },
      message: null,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
    let message = updateResult ? 'Password changed successfully' : 'Password change failed';

    const account = await accountModel.getAccountById(account_id);

    res.render('accounts/manage', {
      firstname: account.firstname,
      accountType: account.accountType,
      accountId: account.account_id,
      message,
    });
  } catch (error) {
    res.render('accounts/update', {
      errors: [{ msg: 'Failed to change password' }],
      account: { account_id },
      message: null,
    });
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, getAccountManagementView, showAccountManagement, showUpdateView, updateAccountInfo, changePassword };
