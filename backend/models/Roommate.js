const mongoose = require("mongoose");

const roommateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["leader", "user"],
    default: "user",
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  history: [
    {
      title: { type: String, required: true },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Roommate", roommateSchema);
