const express = require("express");
const { getNotifications, markNotificationsAsRead, getVapidPublicKey } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", getNotifications);
router.patch("/read", markNotificationsAsRead);
router.get("/vapid-public-key", getVapidPublicKey);

module.exports = router;
