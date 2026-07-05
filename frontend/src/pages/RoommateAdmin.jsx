import { useState, useEffect } from "react";
import axios from "axios";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:5000`
  : "https://roommate-expense-tracker-tmx2.onrender.com";

function RoommateAdmin() {
  const [roommates, setRoommates] = useState([]);
  const [newRoommate, setNewRoommate] = useState("");
  const [password, setPassword] = useState("");
  const [newRoommatePasswords, setNewRoommatePasswords] = useState({});
  const [pendingAmounts, setPendingAmounts] = useState({});
  const [additionalAmounts, setAdditionalAmounts] = useState({});
  const [additionalTitles, setAdditionalTitles] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRoommates = () => {
    axios
      .get(`${API_BASE}/api/roommates`)
      .then((res) => {
        setRoommates(res.data);
        setPendingAmounts(
          res.data.reduce((amounts, roommate) => {
            amounts[roommate._id] = roommate.pendingAmount ?? 0;
            return amounts;
          }, {})
        );
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoommates();
  }, []);

  const handleAddRoommate = async () => {
    if (!newRoommate.trim() || !password.trim()) {
      alert("Please enter both roommate name and a password");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/roommates`, {
        name: newRoommate,
        password: password.trim(),
        pendingAmount: 0,
      });

      alert("Roommate added successfully!");
      setNewRoommate("");
      setPassword("");
      fetchRoommates();
    } catch (error) {
      console.error("Error details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Error adding roommate";
      alert("Error: " + errorMsg);
    }
  };

  const handlePendingAmountChange = (roommateId, value) => {
    setPendingAmounts((currentAmounts) => ({
      ...currentAmounts,
      [roommateId]: value,
    }));
  };

  const handlePasswordChange = (roommateId, value) => {
    setNewRoommatePasswords((prev) => ({
      ...prev,
      [roommateId]: value,
    }));
  };

  const handleUpdatePassword = async (roommateId, roommateName) => {
    const pass = newRoommatePasswords[roommateId];
    if (!pass || !pass.trim()) {
      alert("Please enter a valid password");
      return;
    }

    try {
      await axios.patch(`${API_BASE}/api/roommates/${roommateId}/password`, {
        password: pass.trim(),
      });
      alert(`Password updated successfully for ${roommateName}`);
      setNewRoommatePasswords((prev) => ({
        ...prev,
        [roommateId]: "",
      }));
    } catch (error) {
      console.error(error);
      alert("Error updating password: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAdditionalAmountChange = (roommateId, value) => {
    setAdditionalAmounts((currentAmounts) => ({
      ...currentAmounts,
      [roommateId]: value,
    }));
  };

  const handleAdditionalTitleChange = (roommateId, value) => {
    setAdditionalTitles((currentTitles) => ({
      ...currentTitles,
      [roommateId]: value,
    }));
  };

  const handleUpdatePendingAmount = async (roommateId, roommateName) => {
    const amount = Number(pendingAmounts[roommateId]);

    if (!Number.isFinite(amount) || amount < 0) {
      alert("Please enter a valid pending amount");
      return;
    }

    try {
      await axios.patch(`${API_BASE}/api/roommates/${roommateId}/pending-amount`, {
        pendingAmount: amount,
      });

      alert(`Pending amount updated for ${roommateName}`);
      fetchRoommates();
    } catch (error) {
      console.error("Error details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Error updating pending amount";
      alert("Error: " + errorMsg);
    }
  };

  const handleAddPendingAmount = async (roommateId, roommateName) => {
    const amount = Number(additionalAmounts[roommateId]);
    const title = additionalTitles[roommateId] || "";

    if (!title.trim()) {
      alert("Please enter a title/reason for this amount");
      return;
    }

    if (!Number.isFinite(amount) || amount === 0) {
      alert("Please enter a valid non-zero additional amount");
      return;
    }

    try {
      await axios.patch(`${API_BASE}/api/roommates/${roommateId}/add-pending-amount`, {
        amount,
        title,
      });

      const actionWord = amount > 0 ? "Added" : "Subtracted";
      alert(`${actionWord} Rs ${Math.abs(amount).toFixed(2)} to ${roommateName}'s pending amount`);
      setAdditionalAmounts((currentAmounts) => ({
        ...currentAmounts,
        [roommateId]: "",
      }));
      setAdditionalTitles((currentTitles) => ({
        ...currentTitles,
        [roommateId]: "",
      }));
      fetchRoommates();
    } catch (error) {
      console.error("Error details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Error adding pending amount";
      alert("Error: " + errorMsg);
    }
  };

  const handleApprovePayment = async (roommateId, roommateName) => {
    try {
      await axios.patch(`${API_BASE}/api/roommates/${roommateId}/pending-amount`, {
        pendingAmount: 0,
      });
      alert(`✅ Approved payment for ${roommateName}! Pending amount reset to 0.`);
      fetchRoommates();
    } catch (error) {
      console.error(error);
      alert("Error approving payment: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRoommate = async (roommateId, roommateName) => {
    if (!window.confirm(`Delete ${roommateName} from roommates?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/api/roommates/${roommateId}`);

      alert(`${roommateName} deleted successfully`);
      fetchRoommates();
    } catch (error) {
      console.error("Error details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Error deleting roommate";
      alert("Error: " + errorMsg);
    }
  };

  return (
    <div className="container">
      <h1>Manage Roommates</h1>

      <div className="form-group">
        <label>Add New Roommate</label>
        <input
          type="text"
          placeholder="Enter roommate name"
          value={newRoommate}
          onChange={(e) => setNewRoommate(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <input
          type="password"
          placeholder="Enter password for roommate"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={handleAddRoommate}>Add Roommate</button>

      <h2 style={{ marginTop: "2rem", color: "#667eea" }}>Pending Amounts</h2>

      {loading ? (
        <p>Loading roommates...</p>
      ) : roommates.length === 0 ? (
        <p style={{ color: "#999" }}>No roommates added yet.</p>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          {roommates.map((roommate) => (
            <div
              key={roommate._id}
              style={{
                padding: "1.5rem",
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                borderRadius: "16px",
                marginBottom: "1.2rem",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#fff" }}>{roommate.name}</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#f5576c", fontWeight: "700" }}>
                    Pending: Rs {Number(roommate.pendingAmount || 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteRoommate(roommate._id, roommate.name)}
                    style={{
                      width: "auto",
                      padding: "0.5rem 0.75rem",
                      background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {roommate.hasPaidRequest && (
                <div
                  style={{
                    background: "rgba(245, 87, 108, 0.15)",
                    border: "1px solid rgba(245, 87, 108, 0.3)",
                    padding: "1rem",
                    borderRadius: "10px",
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#f5576c", fontWeight: "600", fontSize: "0.9rem" }}>
                    ⚠️ {roommate.name} has submitted a payment request!
                  </span>
                  <button
                    onClick={() => handleApprovePayment(roommate._id, roommate.name)}
                    style={{
                      width: "auto",
                      padding: "0.5rem 1rem",
                      background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      border: "none",
                      color: "white",
                      borderRadius: "6px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Approve Payment (Reset to 0)
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Pending amount"
                  value={pendingAmounts[roommate._id] ?? ""}
                  onChange={(e) => handlePendingAmountChange(roommate._id, e.target.value)}
                />
                <button
                  onClick={() => handleUpdatePendingAmount(roommate._id, roommate.name)}
                  style={{
                    width: "auto",
                    padding: "0.75rem 1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Save Amount
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "0.75rem",
                  alignItems: "center",
                  marginTop: "0.75rem",
                }}
              >
                <input
                  type="password"
                  placeholder="Set New Password"
                  value={newRoommatePasswords[roommate._id] ?? ""}
                  onChange={(e) => handlePasswordChange(roommate._id, e.target.value)}
                />
                <button
                  onClick={() => handleUpdatePassword(roommate._id, roommate.name)}
                  style={{
                    width: "auto",
                    padding: "0.75rem 1rem",
                    whiteSpace: "nowrap",
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  }}
                >
                  Change Password
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "0.75rem",
                  alignItems: "center",
                  marginTop: "0.75rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Title / Reason (e.g. Water)"
                  value={additionalTitles[roommate._id] ?? ""}
                  onChange={(e) => handleAdditionalTitleChange(roommate._id, e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Additional amount"
                  value={additionalAmounts[roommate._id] ?? ""}
                  onChange={(e) => handleAdditionalAmountChange(roommate._id, e.target.value)}
                />
                <button
                  onClick={() => handleAddPendingAmount(roommate._id, roommate.name)}
                  style={{
                    width: "auto",
                    padding: "0.75rem 1rem",
                    whiteSpace: "nowrap",
                    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  }}
                >
                  Add Amount
                </button>
              </div>

              {roommate.history && roommate.history.length > 0 && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "rgba(20, 20, 35, 0.6)",
                    border: "1px solid rgba(102, 126, 234, 0.15)",
                    borderRadius: "10px",
                    color: "#e0e0e0",
                    fontSize: "0.85rem",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "0.5rem", color: "#667eea", fontWeight: "600" }}>
                    Pending Amount Breakdown:
                  </strong>
                  <ul style={{ margin: "0", paddingLeft: "1.2rem" }}>
                    {roommate.history.map((item, idx) => (
                      <li key={item._id || idx} style={{ marginBottom: "0.4rem" }}>
                        <span style={{ fontWeight: "600" }}>{item.title}</span>: +₹
                        {Number(item.amount).toFixed(2)}{" "}
                        <span style={{ fontSize: "0.75rem", color: "#999" }}>
                          ({new Date(item.date).toLocaleDateString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoommateAdmin;
