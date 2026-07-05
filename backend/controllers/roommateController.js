
const Roommate = require("../models/Roommate");

const addRoommate = async (req, res) => {
  try {
    console.log("Adding roommate with data:", req.body);
    const roommate = new Roommate(req.body);

    const savedRoommate = await roommate.save();
    console.log("Roommate saved successfully:", savedRoommate);

    res.status(201).json(savedRoommate);
  } catch (error) {
    console.error("Error adding roommate:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getRoommates = async (req, res) => {
  try {
    const roommates = await Roommate.find();

    res.status(200).json(roommates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePendingAmount = async (req, res) => {
  try {
    const { pendingAmount } = req.body;
    const amount = Number(pendingAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ message: "Pending amount must be a valid positive number" });
    }

    const updateFields = { pendingAmount: amount };
    if (amount === 0) {
      updateFields.history = [];
    }

    const roommate = await Roommate.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!roommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    res.status(200).json(roommate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPendingAmount = async (req, res) => {
  try {
    const { amount, title } = req.body;
    const extraAmount = Number(amount);

    if (!Number.isFinite(extraAmount) || extraAmount <= 0) {
      return res.status(400).json({ message: "Additional amount must be a valid positive number" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required for adding amount" });
    }

    const roommate = await Roommate.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { pendingAmount: extraAmount },
        $push: { history: { title: title.trim(), amount: extraAmount } },
      },
      { new: true, runValidators: true }
    );

    if (!roommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    res.status(200).json(roommate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoommate = async (req, res) => {
  try {
    const roommate = await Roommate.findByIdAndDelete(req.params.id);

    if (!roommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    res.status(200).json({ message: "Roommate deleted successfully", deletedRoommate: roommate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addRoommate,
  getRoommates,
  updatePendingAmount,
  addPendingAmount,
  deleteRoommate,
};
