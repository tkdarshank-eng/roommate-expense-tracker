const express = require("express");

const {
  addRoommate,
  getRoommates,
  addPendingAmount,
  deleteRoommate,
  updatePendingAmount,
  registerLeader,
  loginUser,
  updateRoommatePassword,
  submitPaymentRequest,
} = require("../controllers/roommateController");

const router = express.Router();

router.get("/", getRoommates);
router.post("/", addRoommate);
router.patch("/:id/pending-amount", updatePendingAmount);
router.patch("/:id/add-pending-amount", addPendingAmount);
router.delete("/:id", deleteRoommate);
router.post("/register-leader", registerLeader);
router.post("/login", loginUser);
router.patch("/:id/password", updateRoommatePassword);
router.patch("/:id/payment-request", submitPaymentRequest);

module.exports = router;
