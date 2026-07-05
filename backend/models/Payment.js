const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  roommateName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paidTo: {
    type: String,
    default: "Darshan",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
