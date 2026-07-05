const express = require("express");

const {
  addRoommate,
  getRoommates,
  addPendingAmount,
  deleteRoommate,
  updatePendingAmount,
} = require("../controllers/roommateController");

const router = express.Router();

router.get("/", getRoommates);
router.post("/", addRoommate);
router.patch("/:id/pending-amount", updatePendingAmount);
router.patch("/:id/add-pending-amount", addPendingAmount);
router.delete("/:id", deleteRoommate);

module.exports = router;
