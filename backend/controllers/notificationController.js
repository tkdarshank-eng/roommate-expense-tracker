const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const getNotifications = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID in headers" });
    }

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID in headers" });
    }

    await Notification.updateMany(
      { recipientId: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead,
};
