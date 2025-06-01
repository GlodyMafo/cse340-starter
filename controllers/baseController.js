const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

baseController.handle404 = function (req, res) {
  res.status(404).render("errors/error", {
    title: "404 - Page introuvable",
    message: "Désolé, cette page n’existe pas.",
  });
}

baseController.handleErrors = function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).render("errors/error", {
    title: "500 - Erreur serveur",
    message: "Une erreur s’est produite sur le serveur.",
  });
}


module.exports = baseController;