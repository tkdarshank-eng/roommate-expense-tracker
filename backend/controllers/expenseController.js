const Expense = require("../models/Expense");
const Roommate = require("../models/Roommate");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { sendPushNotification } = require("../helpers/webPushHelper");

// Add Expense
const addExpense = async (req, res) => {
  try {
    const { amount, paidBy } = req.body;
    const expenseAmount = Number(amount);

    if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ message: "Expense amount must be a valid positive number" });
    }

    const leaderId = req.headers["x-user-id"];
    const userRole = req.headers["x-user-role"];
    if (!leaderId || !mongoose.Types.ObjectId.isValid(leaderId)) {
      return res.status(400).json({ message: "Invalid or missing User ID in headers" });
    }

    let leader = null;
    if (userRole === "leader") {
      leader = await Roommate.findById(leaderId);
    } else {
      const roommate = await Roommate.findById(leaderId);
      if (roommate) {
        leader = await Roommate.findById(roommate.addedBy);
      }
    }

    if (!leader) {
      return res.status(400).json({ message: "No leader found associated with this user" });
    }

    const expense = new Expense({
      ...req.body,
      addedBy: leader._id,
    });

    const savedExpense = await expense.save();

    if (paidBy === leader.name) {
      const roommates = await Roommate.find({ addedBy: leader._id });
      const shareAmount = roommates.length > 0 ? expenseAmount / (roommates.length + 1) : 0;

      if (shareAmount > 0) {
        await Roommate.updateMany(
          { addedBy: leader._id },
          { $inc: { pendingAmount: shareAmount } }
        );
      }
    }

    // Send notifications to all roommates in the group
    try {
      const roommates = await Roommate.find({ addedBy: leader._id });
      const notifierName = userRole === "leader" ? leader.name : req.body.paidBy || "Leader";
      const message = `🔔 New shared expense added: "${savedExpense.title}" of ₹${savedExpense.amount} (paid by ${notifierName})`;
      
      const notifications = roommates.map((roommate) => ({
        recipientId: roommate._id,
        message,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        
        // Trigger W3C Web Push for each roommate
        for (const roommate of roommates) {
          sendPushNotification(roommate._id, message);
        }
      }
    } catch (notifError) {
      console.error("Failed to send expense notifications:", notifError);
    }

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Expenses
const getExpenses = async (req, res) => {
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

    const expenses = await Expense.find({ addedBy: leaderId });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Expense
const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Delete request for ID:", id);
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format:", id);
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      console.log("Expense not found for ID:", id);
      return res.status(404).json({ message: "Expense not found" });
    }

    const leaderId = req.headers["x-user-id"];
    const userRole = req.headers["x-user-role"];

    let leader = null;
    if (userRole === "leader" && leaderId && mongoose.Types.ObjectId.isValid(leaderId)) {
      leader = await Roommate.findById(leaderId);
    }

    // Adjust roommate pending amounts if the deleted expense was paid by the leader
    if (leader && expense.paidBy === leader.name) {
      const roommates = await Roommate.find({ addedBy: leader._id });
      const shareAmount = roommates.length > 0 ? expense.amount / (roommates.length + 1) : 0;

      if (shareAmount > 0) {
        for (const roommate of roommates) {
          const newAmount = Math.max(0, (roommate.pendingAmount || 0) - shareAmount);
          roommate.pendingAmount = newAmount;
          await roommate.save();
        }
      }
    }

    await Expense.findByIdAndDelete(id);

    // Send notifications to all roommates in the group
    try {
      if (leader) {
        const roommates = await Roommate.find({ addedBy: leader._id });
        const message = `🗑️ Expense deleted: "${expense.title}" of ₹${expense.amount}`;
        const notifications = roommates.map((roommate) => ({
          recipientId: roommate._id,
          message,
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          
          // Trigger W3C Web Push for each roommate
          for (const roommate of roommates) {
            sendPushNotification(roommate._id, message);
          }
        }
      }
    } catch (notifError) {
      console.error("Failed to send delete notifications:", notifError);
    }

    console.log("Expense deleted successfully:", id);
    res.status(200).json({ message: "Expense deleted successfully", deletedExpense: expense });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
};
