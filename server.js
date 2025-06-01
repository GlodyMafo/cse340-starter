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
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute") 
const utilities = require("./utilities/")


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

app.get("/", baseController.buildHome)
app.use("/inv", inventoryRoute)




app.use(static)


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
// app.use(async (err, req, res, next) => {
//   let nav = await utilities.getNav()
//   console.error(`Error at: "${req.originalUrl}": ${err.message}`)
//   res.render("errors/error", {
//     title: err.status || 'Server Error',
//     message: err.message,
//     nav
//   })
// })

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
