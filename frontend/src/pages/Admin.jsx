import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://roommate-expense-tracker-tmx2.onrender.com";

function Admin() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [roommates, setRoommates] = useState([]);

  useEffect(() => {
  axios
    .get(`${API_BASE}/api/roommates`)
    .then((res) => setRoommates(res.data))
    .catch((err) => console.log(err));
}, []);


  const addExpense = async () => {
    if (!title || !amount || !paidBy) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/expenses`, {
        title,
        amount: Number(amount),
        paidBy,
      });

      alert("✅ Expense Added Successfully!");

      setTitle("");
      setAmount("");
      setPaidBy("");
    } catch (error) {
      console.log(error);
      alert("Error adding expense");
    }
  };

  return (
    <div className="container">
      <h1>💰 Add New Expense</h1>

      <div className="form-group">
        <label>Expense Title</label>
        <input
          type="text"
          placeholder="e.g., Rent, Groceries, etc."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Select Who Paid</label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          <option value="">Choose a roommate...</option>
          {roommates.map((roommate) => (
            <option
              key={roommate._id}
              value={roommate.name}
            >
              {roommate.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Amount (₹)</label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button onClick={addExpense}>
        ✨ Add Expense
      </button>
    </div>
  );
}

export default Admin; 
