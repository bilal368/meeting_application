const express = require('express');
const router = express.Router();
const endpointsController = require('../controller/endpoints');
const auth = require('../auth/middleware')
const userAuth = auth.UserAuth;
//routes
router.post("/bundleupdate", auth.endPointsAuth, endpointsController.bundlepurchaseupdate);

router.post("/createcustomer", auth.endPointsAuth, endpointsController.createcustomer);
router.post("/suspendcustomer", auth.endPointsAuth, endpointsController.suspendcustomer);
router.post("/bundlepurchase", auth.endPointsAuth, endpointsController.bundlepurchase);

router.post("/accountbalance", auth.endPointsAuth, endpointsController.accountbalance);
router.post("/accountsearch", auth.endPointsAuth, endpointsController.accountsearch);
router.delete("/deleteuser", auth.endPointsAuth, endpointsController.delete);

module.exports = router;                