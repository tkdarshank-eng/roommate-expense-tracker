const express = require("express");
const { getNotifications, markNotificationsAsRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", getNotifications);
router.patch("/read", markNotificationsAsRead);

module.exports = router;
