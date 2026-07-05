const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");

const expenseRoutes = require("./routes/expenseRoutes");
const roommateRoutes = require("./routes/roommateRoutes");
const pendingRoutes = require("./routes/pendingRoutes");
const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use("/api/expenses", expenseRoutes);
app.use("/api/roommates", roommateRoutes);
app.use("/api/pending", pendingRoutes);

const currentDnsServers = dns.getServers();
if (
  currentDnsServers.length === 0 ||
  currentDnsServers.every((server) => server === "127.0.0.1" || server === "::1")
) {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("DNS fallback enabled:", dns.getServers());
} else {
  console.log("DNS servers:", currentDnsServers);
}

console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
  console.error("MongoDB Error:");
  console.error(err);
});

app.get("/", (req, res) => {
  res.send("Backend + MongoDB Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/test", (req, res) => {
  res.send("Test route working");
});