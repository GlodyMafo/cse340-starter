const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  

  res.render("index", {title: "Home", nav})
}

baseController.handle404 = function (req, res) {
  res.status(404).render("errors/error", {
    title: "404 - Can't find this page",
    message: "Sorry this page is not existing.",
  });
}

baseController.handleErrors = function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).render("errors/error", {
    title: "500 - Server Error",
    message: "There is an error on a server side"
  });
}


module.exports = baseController;