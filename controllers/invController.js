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

  const classificationSelect = await utilities.buildClassificationList()


  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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


/* Update Inventory Form POST */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0]?.inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); // get the ID from the URL
  let nav = await utilities.getNav(); // navigation bar
  const itemData = await invModel.getVehicleById(inv_id); 
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id); // build dropdown
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`; // dynamic name for the title

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  });
};


/* ***********************************
 * Deliver Delete Inventory Confirmation View
 * *********************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  try {
    const data = await invModel.getVehicleById(inv_id)
    const itemName = `${data.inv_make} ${data.inv_model}`
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: data.inv_id,
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_price: data.inv_price,
      itemName,
    })
  } catch (error) {
    next(error)
  }
}

/* ***********************************
 * Process Inventory Deletion
 * *********************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  try {
    const result = await invModel.deleteInventoryItem(inv_id)
    if (result.rowCount) {
      req.flash("notice", "Inventory item successfully deleted.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Delete failed. Try again.")
      res.redirect("/inv/delete/" + inv_id)
    }
  } catch (error) {
    next(error)
  }
}

module.exports = invCont