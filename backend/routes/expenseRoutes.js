const express = require("express");

const {
  addExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expenseController");

const router = express.Router();

console.log("Expense Routes Loaded");

// GET all expenses
router.get("/", getExpenses);

// POST expense
router.post("/", addExpense);

// DELETE expense
router.delete("/:id", (req, res, next) => {
  console.log("DELETE route reached");
  next();
}, deleteExpense);

module.exports = router;