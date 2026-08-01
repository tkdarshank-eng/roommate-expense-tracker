const webpush = require("web-push");
const Roommate = require("../models/Roommate");

let isPushConfigured = false;

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      "mailto:tkdarshankumar@gmail.com",
      process.env.VAPID_PUBLIC_KEY.trim(),
      process.env.VAPID_PRIVATE_KEY.trim()
    );
    isPushConfigured = true;
    console.log("W3C Web Push configured successfully.");
  } catch (err) {
    console.error("Failed to initialize VAPID details for web-push:", err.message);
  }
} else {
  console.warn("WARNING: VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is missing from environment. Offline Web Push notifications are disabled.");
}

/**
 * Send W3C Web Push Notification to all active subscriptions of a roommate
 * @param {String} recipientId Roommate ID
 * @param {String} message Notification alert message
 */
const sendPushNotification = async (recipientId, message) => {
  if (!isPushConfigured) {
    return;
  }

  try {
    const roommate = await Roommate.findById(recipientId);
    if (!roommate || !roommate.pushSubscriptions || roommate.pushSubscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      title: "Roomie Alert 🏠",
      body: message,
    });

    const failedEndpoints = [];

    for (const sub of roommate.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payload
        );
      } catch (err) {
        console.error("Failed to send push alert to endpoint:", sub.endpoint, err.message);
        if (err.statusCode === 410 || err.statusCode === 404) {
          failedEndpoints.push(sub.endpoint);
        }
      }
    }

    if (failedEndpoints.length > 0) {
      roommate.pushSubscriptions = roommate.pushSubscriptions.filter(
        (sub) => !failedEndpoints.includes(sub.endpoint)
      );
      await roommate.save();
      console.log(`Cleaned up ${failedEndpoints.length} stale push subscription(s) for ${roommate.name}`);
    }
  } catch (error) {
    console.error("Error inside sendPushNotification:", error.message);
  }
};

module.exports = { sendPushNotification };
