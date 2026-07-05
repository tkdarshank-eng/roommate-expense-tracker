import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

const API_BASE = "https://roommate-expense-tracker-tmx2.onrender.com";

function Expenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = () => {
    axios
      .get(`${API_BASE}/api/expenses`)
      .then((res) => {
        setExpenses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const fetchRoommates = () => {
    axios
      .get(`${API_BASE}/api/roommates`)
      .then((res) => {
        setRoommates(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getTotalPeople = () => {
    const nonLeaderRoommates = roommates.filter(r => r.name.toLowerCase() !== "darshan");
    return nonLeaderRoommates.length + 1;
  };

  const calculateMyPending = () => {
    let totalOwes = 0;
    const totalPeople = getTotalPeople();
    expenses.forEach((exp) => {
      if (exp.paidBy.toLowerCase() !== user.name.toLowerCase() && exp.paidBy) {
        totalOwes += exp.amount / totalPeople;
      }
    });
    return totalOwes.toFixed(2);
  };

  const getMyPendingFromDB = () => {
    const currentRoommate = roommates.find((r) => r.name.trim().toLowerCase() === user.name.trim().toLowerCase());
    return currentRoommate ? (currentRoommate.pendingAmount ?? 0) : 0;
  };

  const getCombinedExpenses = () => {
    const currentRoommate = roommates.find((r) => r.name.trim().toLowerCase() === user.name.trim().toLowerCase());
    console.log("getCombinedExpenses: user.name =", user.name);
    console.log("getCombinedExpenses: currentRoommate =", currentRoommate);
    console.log("getCombinedExpenses: roommates =", roommates);
    const individualExpenses = currentRoommate && currentRoommate.history
      ? currentRoommate.history.map((item) => ({
          _id: item._id,
          title: item.title,
          amount: item.amount,
          paidBy: "Darshan (Leader)",
          date: item.date,
          isIndividual: true,
        }))
      : [];

    const sharedExpenses = expenses.map((exp) => ({
      ...exp,
      isIndividual: false,
    }));

    const result = [...individualExpenses, ...sharedExpenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    console.log("getCombinedExpenses: sorted combined result =", result);
    return result;
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/api/expenses/${id}`);
      alert("✅ Expense deleted successfully!");
      fetchExpenses();
      fetchRoommates();
    } catch (error) {
      console.error(error);
      alert("❌ Error deleting expense: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchRoommates();
  }, []);

  return (
    <div className="container">
      {user.role !== "leader" ? (
        // For non-leaders, show their pending amount & QR code to pay, followed by the list of expenses
        <>
          {(() => {
            const myPendingAmount = getMyPendingFromDB();
            return (
              <div
                style={{
                  background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                  color: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 15px rgba(245, 87, 108, 0.3)",
                  marginTop: "2rem",
                  marginBottom: "2rem",
                }}
              >
                <p style={{ fontSize: "0.9rem", margin: "0", fontWeight: "600", opacity: "0.95" }}>
                  💳 You Owe to Darshan
                </p>
                <div style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0.8rem 0" }}>
                  ₹{Number(myPendingAmount).toFixed(2)}
                </div>
                <div
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    marginTop: "25px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    color: "black",
                  }}
                >
                  <h3>Scan QR to Pay</h3>

                  <QRCode
                    size={180}
                    value={`upi://pay?pa=tkdarshankumar@oksbi&pn=Darshan&am=${Number(myPendingAmount).toFixed(2)}&cu=INR`}
                  />

                  <p style={{ marginTop: "15px", fontWeight: "bold" }}>
                    UPI ID: tkdarshankumar@oksbi
                  </p>

                  <a
                    href={`upi://pay?pa=tkdarshankumar@oksbi&pn=Darshan&am=${Number(myPendingAmount).toFixed(2)}&cu=INR`}
                    onClick={(e) => {
                      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                      if (!isMobile) {
                        e.preventDefault();
                        alert("UPI app links are only supported on mobile devices. Please scan the QR code using your phone to pay!");
                      }
                    }}
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      background: "linear-gradient(135deg, #4285F4 0%, #34A853 100%)",
                      color: "white",
                      textDecoration: "none",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      textAlign: "center",
                      boxShadow: "0 4px 15px rgba(66, 133, 244, 0.3)",
                      width: "80%",
                    }}
                  >
                    📱 Pay via Google Pay / UPI App
                  </a>

                  <button
                    style={{
                      marginTop: "15px",
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      width: "80%",
                    }}
                    onClick={() => alert("Payment request sent to Leader")}
                  >
                    I've Paid
                  </button>
                </div>
              </div>
            );
          })()}

          {(() => {
            const currentRoommate = roommates.find((r) => r.name.trim().toLowerCase() === user.name.trim().toLowerCase());
            if (currentRoommate && currentRoommate.history && currentRoommate.history.length > 0) {
              return (
                <div
                  style={{
                    background: "rgba(30, 30, 50, 0.8)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    marginBottom: "2rem",
                  }}
                >
                  <h3 style={{ color: "#667eea", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
                    📋 Pending Amount Breakdown
                  </h3>
                  <ul style={{ margin: "0", paddingLeft: "1.2rem", color: "#e0e0e0" }}>
                    {currentRoommate.history.map((item, idx) => (
                      <li key={item._id || idx} style={{ marginBottom: "0.4rem" }}>
                        <span style={{ fontWeight: "600" }}>{item.title}</span>: +₹
                        {Number(item.amount).toFixed(2)}{" "}
                        <span style={{ fontSize: "0.8rem", color: "#999" }}>
                          ({new Date(item.date).toLocaleDateString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })()}

          <h2 style={{ color: "#667eea", marginBottom: "1rem" }}>📋 Your Expenses</h2>
          {loading ? (
            <div className="empty-state">
              <p>Loading expenses...</p>
            </div>
          ) : getCombinedExpenses().length === 0 ? (
            <div className="empty-state">
              <p>No expenses yet.</p>
            </div>
          ) : (
            <div>
              {getCombinedExpenses().map((expense, index) => (
                <div
                  key={expense._id || index}
                  className="expense-item"
                  style={
                    expense.isIndividual
                      ? {
                          borderLeft: "4px solid #f5576c",
                          background: "rgba(245, 87, 108, 0.05)",
                        }
                      : {}
                  }
                >
                  <div>
                    <div
                      className="expense-title"
                      style={expense.isIndividual ? { color: "#f5576c", fontWeight: "700" } : {}}
                    >
                      {expense.title}
                    </div>
                    <div className="expense-details">
                      Paid by: <strong>{expense.paidBy}</strong> on{" "}
                      {new Date(expense.date).toLocaleDateString()}
                      {expense.isIndividual && " • Individual Charge"}
                    </div>
                  </div>
                  <div className="expense-actions">
                    <div className="expense-amount">
                      ₹{expense.isIndividual ? Number(expense.amount).toFixed(2) : expense.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // For leaders, show the full list of all expenses
        <>
          <h1>📊 All Expenses</h1>
          {loading ? (
            <div className="empty-state">
              <p>Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses yet. Add one from the Manage Expenses page!</p>
            </div>
          ) : (
            <div>
              {expenses.map((expense, index) => (
                <div key={expense._id || index} className="expense-item">
                  <div>
                    <div className="expense-title">{expense.title}</div>
                    <div className="expense-details">
                      Paid by: <strong>{expense.paidBy}</strong> on{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="expense-actions" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className="expense-amount">₹{expense.amount}</div>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Expenses;
