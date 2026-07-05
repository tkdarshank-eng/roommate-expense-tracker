const PendingAmount = require("../models/PendingAmount");

const addPendingAmount = async (req, res) => {
  try {
    const { roommateName, pendingAmount, notes } = req.body;

    if (!roommateName || pendingAmount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let pending = await PendingAmount.findOne({ roommateName });

    if (pending) {
      pending.pendingAmount = Number(pendingAmount);
      pending.notes = notes || "";
      pending.lastUpdated = Date.now();
      await pending.save();
    } else {
      pending = new PendingAmount({
        roommateName,
        pendingAmount: Number(pendingAmount),
        notes: notes || "",
      });
      await pending.save();
    }

    res.status(201).json(pending);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding pending amount" });
  }
};

const getPendingAmounts = async (req, res) => {
  try {
    const pendingAmounts = await PendingAmount.find();
    res.json(pendingAmounts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching pending amounts" });
  }
};

const getPendingAmount = async (req, res) => {
  try {
    const { roommateName } = req.params;
    const pending = await PendingAmount.findOne({ roommateName });
    res.json(pending || { roommateName, pendingAmount: 0, notes: "" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching pending amount" });
  }
};

const deletePendingAmount = async (req, res) => {
  try {
    const { roommateName } = req.params;
    await PendingAmount.deleteOne({ roommateName });
    res.json({ message: "Pending amount deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting pending amount" });
  }
};

module.exports = { addPendingAmount, getPendingAmounts, getPendingAmount, deletePendingAmount };
