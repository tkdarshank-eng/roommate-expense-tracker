import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://roommate-expense-tracker-tmx2.onrender.com";

function ExpenseManager() {
  const [roommates, setRoommates] = useState([]);
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [showAllOption, setShowAllOption] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchRoommates();
    fetchExpenses();
  }, []);

  const fetchRoommates = () => {
    axios
      .get(`${API_BASE}/api/roommates`)
      .then((res) => {
        setRoommates(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const fetchExpenses = () => {
    axios
      .get(`${API_BASE}/api/expenses`)
      .then((res) => setExpenses(res.data))
      .catch((err) => console.log(err));
  };

  const handleAddExpense = async () => {
    if (!title || !amount) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const expenseData = {
        title,
        amount: Number(amount),
        paidBy: "Darshan", // Always Darshan pays
      };

      await axios.post(`${API_BASE}/api/expenses`, expenseData);

      alert("✅ Expense added successfully!");
      setTitle("");
      setAmount("");
      fetchExpenses();
      setSelectedRoommate(null);
      setShowAllOption(false);
    } catch (error) {
      console.log(error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Delete this expense?")) {
      try {
        await axios.delete(`${API_BASE}/api/expenses/${id}`);
        alert("✅ Deleted!");
        fetchExpenses();
      } catch (error) {
        alert("❌ Error: " + error.message);
      }
    }
  };

  const getRoommateExpenses = (roommateName) => {
    return expenses.filter((exp) => exp.paidBy === roommateName);
  };

  const getTotalPeople = () => {
    const nonLeaderRoommates = roommates.filter(r => r.name !== "Darshan");
    return nonLeaderRoommates.length + 1;
  };

  const calculatePendingAmount = (roommateName) => {
    let totalOwes = 0;
    const totalPeople = getTotalPeople();
    expenses.forEach((exp) => {
      // If this roommate didn't pay but others did
      if (exp.paidBy !== roommateName && exp.paidBy) {
        totalOwes += exp.amount / totalPeople;
      }
    });
    return totalOwes.toFixed(2);
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div>
      {/* All Roommates Option */}
      {!selectedRoommate && !showAllOption && (
        <div className="container">
          <h1>📋 Expense Manager</h1>

          <button
            onClick={() => setShowAllOption(true)}
            style={{
              width: "100%",
              marginBottom: "2rem",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              padding: "1.5rem",
              fontSize: "1.1rem",
              borderRadius: "12px",
              border: "none",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(67, 233, 123, 0.4)",
            }}
          >
            👥 Add Expense for All (Split Equally)
          </button>

          <h2 style={{ color: "#667eea", marginBottom: "1.5rem", fontSize: "1.3rem" }}>
            Individual Roommates:
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {roommates.map((roommate) => (
              <div
                key={roommate._id}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  cursor: "pointer",
                  transition: "transform 0.3s",
                }}
                onClick={() => setSelectedRoommate(roommate.name)}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>👤</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem" }}>
                  {roommate.name}
                </div>
                <div style={{ fontSize: "0.9rem", opacity: "0.9", marginBottom: "1rem" }}>
                  Pending: ₹{calculatePendingAmount(roommate.name)}
                </div>
                <button
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "white",
                    color: "#667eea",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoommate(roommate.name);
                  }}
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Expense for All */}
      {showAllOption && (
        <div className="container">
          <button
            onClick={() => setShowAllOption(false)}
            style={{
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              background: "#f5576c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ← Back
          </button>

          <h1>👥 Add Expense for All Roommates</h1>

          <div className="form-group">
            <label>Expense Title</label>
            <input
              type="text"
              placeholder="e.g., Rent, Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Amount (₹)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {amount && roommates.length > 0 && (
            <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "8px", marginBottom: "1rem" }}>
              <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                💰 Each person pays: ₹{(Number(amount) / roommates.length).toFixed(2)}
              </p>
            </div>
          )}

          <button onClick={handleAddExpense}>✨ Add Shared Expense</button>
        </div>
      )}

      {/* Individual Roommate Management */}
      {selectedRoommate && !showAllOption && (
        <div className="container">
          <button
            onClick={() => setSelectedRoommate(null)}
            style={{
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              background: "#f5576c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ← Back
          </button>

          <h1>💳 {selectedRoommate}'s Expenses</h1>

          <h2 style={{ color: "#667eea", marginBottom: "1rem", marginTop: "2rem" }}>
            Add New Expense
          </h2>

          <div className="form-group">
            <label>Expense Title</label>
            <input
              type="text"
              placeholder="e.g., Coffee, Travel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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

          <button
            onClick={() => {
              const expenseData = {
                title,
                amount: Number(amount),
                paidBy: selectedRoommate,
              };
              axios.post(`${API_BASE}/api/expenses`, expenseData).then(() => {
                alert("✅ Expense added!");
                setTitle("");
                setAmount("");
                fetchExpenses();
              });
            }}
          >
            ➕ Add Expense
          </button>

          <h2 style={{ color: "#667eea", marginBottom: "1rem", marginTop: "2rem" }}>
            {selectedRoommate}'s Recent Expenses
          </h2>

          {getRoommateExpenses(selectedRoommate).length === 0 ? (
            <p style={{ color: "#999" }}>No expenses yet</p>
          ) : (
            <div>
              {getRoommateExpenses(selectedRoommate).map((expense) => (
                <div
                  key={expense._id}
                  style={{
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "1rem" }}>{expense.title}</div>
                    <div style={{ fontSize: "0.85rem", opacity: "0.9" }}>
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>₹{expense.amount}</div>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "rgba(255,255,255,0.3)",
                        border: "1px solid white",
                        color: "white",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpenseManager;
