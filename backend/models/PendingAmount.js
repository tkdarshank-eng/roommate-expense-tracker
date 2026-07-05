const mongoose = require("mongoose");

const pendingAmountSchema = new mongoose.Schema({
  roommateName: {
    type: String,
    required: true,
    unique: true,
  },
  pendingAmount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: "",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PendingAmount", pendingAmountSchema);
