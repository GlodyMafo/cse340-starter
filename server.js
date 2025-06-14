/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const bodyParser = require("body-parser")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute") 
const accountRoute = require ('./routes/accountRoute')
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')
const cookieParser = require("cookie-parser")



/* ***********************
 * View Engine and Templates
 *************************/

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root



/* Middleware pour injecter `nav` dans res.locals */
app.use(async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.locals.nav = nav
    next()
  } catch (err) {
    next(err)
  }
})


/* ***********************
 * Middleware session
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// parsing middleware

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//Cookieparser middleware
app.use(cookieParser())

app.use(utilities.checkJWTToken)


//Routes

app.get("/", baseController.buildHome)
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)


app.use(static)


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/


// 404 errors
app.use(baseController.handle404); 

// server error
app.use(baseController.handleErrors); 



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/


const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
