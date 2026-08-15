import { useEffect, useState } from "react";
import axios from "axios";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:5000`
  : "https://roommate-expense-tracker-tmx2.onrender.com";

function MonthlyExpenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, roomRes] = await Promise.all([
          axios.get(`${API_BASE}/api/expenses`),
          axios.get(`${API_BASE}/api/roommates`)
        ]);
        setExpenses(expRes.data);
        setRoommates(roomRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTotalPeople = () => {
    const leaderName = user.leaderName || user.name || "Darshan";
    const nonLeaderRoommates = roommates.filter(
      (r) => r.name && r.name.toLowerCase() !== leaderName.toLowerCase()
    );
    return nonLeaderRoommates.length + 1;
  };

  const getCombinedExpenses = () => {
    if (!user || !user.name) return [];
    const currentRoommate = roommates.find(
      (r) => r.name && r.name.trim().toLowerCase() === user.name.trim().toLowerCase()
    );

    const individualExpenses =
      currentRoommate && currentRoommate.history
        ? currentRoommate.history.map((item) => ({
            ...item,
            isIndividual: true,
          }))
        : [];

    const sharedExpenses = expenses.map((exp) => ({
      ...exp,
      isIndividual: false,
    }));

    return [...individualExpenses, ...sharedExpenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  };

  const getMonthlyGroups = () => {
    const combined = getCombinedExpenses();
    const totalPeople = getTotalPeople();
    const groups = {};

    combined.forEach((exp) => {
      const date = new Date(exp.date);
      const monthName = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const groupKey = `${monthName} ${year}`;

      const shareAmount = exp.isIndividual
        ? exp.amount
        : exp.amount / totalPeople;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          month: monthName,
          year,
          groupKey,
          total: 0,
          expenses: [],
        };
      }

      groups[groupKey].total += shareAmount;
      groups[groupKey].expenses.push({
        ...exp,
        shareAmount,
      });
    });

    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return months.indexOf(b.month) - months.indexOf(a.month);
    });
  };

  const monthlyGroups = getMonthlyGroups();

  return (
    <div className="container" style={{ paddingBottom: "80px" }}>
      <h1>📊 Monthly Expenses</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "-1rem", marginBottom: "1.5rem" }}>
        Your personalized share of expenses grouped by month.
      </p>

      {loading ? (
        <div className="empty-state">
          <p>Loading monthly expenses...</p>
        </div>
      ) : monthlyGroups.length === 0 ? (
        <div className="empty-state">
          <p>No expenses recorded yet.</p>
        </div>
      ) : (
        <div>
          {monthlyGroups.map((group) => {
            const isExpanded = expandedMonth === group.groupKey;
            return (
              <div key={group.groupKey} className="card" style={{ marginBottom: "1.2rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem"
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                      {group.month} {group.year}
                    </h2>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                      {group.expenses.length} expense{group.expenses.length !== 1 && "s"}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: "900",
                        background: "var(--accent-gradient-purple)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      ₹{group.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => setExpandedMonth(isExpanded ? null : group.groupKey)}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "var(--accent-purple)",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "700",
                        width: "auto",
                        minHeight: "auto",
                        marginTop: "4px",
                        boxShadow: "none"
                      }}
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: "1.25rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      paddingTop: "1rem"
                    }}
                  >
                    {group.expenses.map((expense, idx) => (
                      <div
                        key={expense._id || idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.75rem",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.02)",
                          marginBottom: "0.5rem",
                          border: "1.5px solid rgba(255, 255, 255, 0.04)"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#fff" }}>
                            {expense.title}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {expense.isIndividual ? "Individual Charge" : "Shared Expense"} • {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          style={{
                            fontWeight: "800",
                            fontSize: "0.95rem",
                            color: expense.shareAmount < 0 ? "#ff7675" : "#00b894"
                          }}
                        >
                          {expense.shareAmount < 0 ? "" : "+"}₹{Math.abs(expense.shareAmount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MonthlyExpenses;
