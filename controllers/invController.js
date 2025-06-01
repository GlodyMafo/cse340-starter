const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


// Detail

invCont.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);
    if (!vehicle) {
      return next(); 
    }
    const html = utilities.buildDetailHtml(vehicle);
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      detailHtml: html,
    });
  } catch (error) {
    next(error); 
  }
}

module.exports = invCont