const express = require("express");
const { addPendingAmount, getPendingAmounts, getPendingAmount, deletePendingAmount } = require("../controllers/pendingController");

const router = express.Router();

router.post("/", addPendingAmount);
router.get("/", getPendingAmounts);
router.get("/:roommateName", getPendingAmount);
router.delete("/:roommateName", deletePendingAmount);

module.exports = router;
