const express = require("express");
const { recordPayment, getPayments } = require("../controllers/paymentController");

const router = express.Router();

router.post("/", recordPayment);
router.get("/", getPayments);

module.exports = router;
