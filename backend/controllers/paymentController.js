const Payment = require("../models/Payment");
const Roommate = require("../models/Roommate");

const recordPayment = async (req, res) => {
  try {
    const { roommateName, amount } = req.body;

    if (!roommateName || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const payment = new Payment({
      roommateName,
      amount: Number(amount),
      paidTo: "Darshan",
    });

    const savedPayment = await payment.save();

    await Roommate.findOneAndUpdate(
      { name: roommateName },
      { pendingAmount: 0 },
      { new: true }
    );

    res.status(201).json(savedPayment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error recording payment" });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

module.exports = { recordPayment, getPayments };
