const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Classification

router.get("/type/:classificationId", invController.buildByClassificationId);

// detail
router.get('/detail/:inv_id', invController.buildDetailView);

//intentional error

router.get('/intentional-error', (req, res, next) => {
  try {
    throw new Error("intentional error for test");
  } catch (err) {
    next(err);
  }
});



module.exports = router;