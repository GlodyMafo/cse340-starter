const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inv-validation")


// Classification

router.get("/type/:classificationId", invController.buildByClassificationId);

// detail
router.get('/detail/:inv_id', invController.buildDetailView);

//inventory management

router.get("/", invController.buildManagement);

// Add Classification Form View
router.get("/add-classification", invController.buildAddClassification)

// Process Add Classification Form
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)


// Add Inventory Item Form View
router.get("/add-inventory", invController.buildAddInventory)

// Handle Add Inventory Item POST
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
)

//intentional error

router.get('/intentional-error', (req, res, next) => {
  try {
    throw new Error("intentional error for test");
  } catch (err) {
    next(err);
  }
});



module.exports = router;