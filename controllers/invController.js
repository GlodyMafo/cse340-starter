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

// Management

 invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    message: req.flash("message")
  })
}

/* Show Add Classification Form */
 invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

/* Handle Add Classification POST */
 invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  let nav = await utilities.getNav()

  const regResult = await invModel.addClassification(classification_name)

  if (regResult) {
    req.flash("message", "Classification successfully added.")
    res.redirect("/inv/")
  } else {
    req.flash("message", "Failed to add classification.")
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  }
}


/* Build Add Inventory Form */
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let result = await invModel.getClassifications()
  let classifications = result.rows // 👈 this is the actual array

  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classifications,
    errors: null
  })
}


/* Handle Inventory Form POST */
invCont.addInventory = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  let nav = await utilities.getNav()
  const addResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  )

  if (addResult) {
    req.flash("message", "Vehicle successfully added.")
    res.redirect("/inv/")
  } else {
    let classifications = await invModel.getClassifications()
    req.flash("message", "Vehicle addition failed.")
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classifications,
      errors: null
    })
  }
}



module.exports = invCont