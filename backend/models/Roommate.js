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
  upiId: {
    type: String,
    default: "",
  },
  pushSubscriptions: [
    {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
  ],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  hasPaidRequest: {
    type: Boolean,
    default: false,
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
