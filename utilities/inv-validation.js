const { body, validationResult } = require("express-validator")
const utilities = require("./")

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .isAlpha()
      .withMessage("Classification name must only contain letters.")
  ]
}

const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array()
    })
    return
  }
  next()
}

const inventoryRules = () => {
  return [
    body("classification_id").isInt().withMessage("Classification is required."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900 }).withMessage("Year is required."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").isFloat().withMessage("Price must be a number."),
    body("inv_miles").isInt().withMessage("Miles must be an integer."),
    body("inv_color").trim().notEmpty().withMessage("Color is required.")
  ]
}

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classifications = await invModel.getClassifications()
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classifications,
      errors: errors.array()
    })
    return
  }
  next()
}

const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classifications = await invModel.getClassifications()
    
    // Extract the fields from the request body to send back to the form
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
      classification_id
    } = req.body
    
    res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect: classifications,
      errors: errors.array(),
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
    })
    return
  }
  next()
}


module.exports = {
  classificationRules,
  checkClassificationData,
  checkInventoryData,
  inventoryRules,
  checkUpdateData
}
