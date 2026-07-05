const Roommate = require("../models/Roommate");
const mongoose = require("mongoose");

const addRoommate = async (req, res) => {
  try {
    const leaderId = req.headers["x-user-id"];
    if (!leaderId || !mongoose.Types.ObjectId.isValid(leaderId)) {
      return res.status(400).json({ message: "Invalid or missing Leader ID in headers" });
    }

    console.log("Adding roommate with data:", req.body);
    const roommate = new Roommate({
      ...req.body,
      addedBy: leaderId,
      role: "user",
    });

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
    const userId = req.headers["x-user-id"];
    const userRole = req.headers["x-user-role"];

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID in headers" });
    }

    let leaderId = userId;
    if (userRole === "user") {
      const roommate = await Roommate.findById(userId);
      if (roommate) {
        leaderId = roommate.addedBy;
      }
    }

    const roommates = await Roommate.find({ addedBy: leaderId });

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
      updateFields.hasPaidRequest = false;
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

    if (!Number.isFinite(extraAmount) || extraAmount === 0) {
      return res.status(400).json({ message: "Additional amount must be a valid non-zero number" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required for adding amount" });
    }

    const roommate = await Roommate.findById(req.params.id);
    if (!roommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    const newPendingAmount = Math.max(0, (roommate.pendingAmount || 0) + extraAmount);
    roommate.pendingAmount = newPendingAmount;
    roommate.history.push({ title: title.trim(), amount: extraAmount });

    if (newPendingAmount === 0) {
      roommate.history = [];
      roommate.hasPaidRequest = false;
    }

    const savedRoommate = await roommate.save();
    res.status(200).json(savedRoommate);
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

const registerLeader = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim() || !password || !password.trim()) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const existingRoommate = await Roommate.findOne({
      name: { $regex: new RegExp("^" + username.trim() + "$", "i") },
    });
    if (existingRoommate) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const leader = new Roommate({
      name: username.trim(),
      password: password.trim(),
      role: "leader",
      pendingAmount: 0,
    });

    const savedLeader = await leader.save();
    res.status(201).json(savedLeader);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim() || !password || !password.trim()) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const roommate = await Roommate.findOne({
      name: { $regex: new RegExp("^" + username.trim() + "$", "i") },
    });

    if (!roommate) {
      return res.status(401).json({ message: "Invalid Username or Password" });
    }

    if (roommate.password !== password.trim()) {
      return res.status(401).json({ message: "Invalid Username or Password" });
    }

    res.status(200).json({
      id: roommate._id,
      name: roommate.name,
      role: roommate.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoommatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || !password.trim()) {
      return res.status(400).json({ message: "Password is required" });
    }

    const roommate = await Roommate.findByIdAndUpdate(
      req.params.id,
      { password: password.trim() },
      { new: true }
    );

    if (!roommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitPaymentRequest = async (req, res) => {
  try {
    const roommate = await Roommate.findByIdAndUpdate(
      req.params.id,
      { hasPaidRequest: true },
      { new: true }
    );

    if (!roommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    res.status(200).json(roommate);
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
  registerLeader,
  loginUser,
  updateRoommatePassword,
  submitPaymentRequest,
};
