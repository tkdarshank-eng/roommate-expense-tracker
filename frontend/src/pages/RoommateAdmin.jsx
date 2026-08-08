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

function RoommateAdmin({ user }) {
  const [roommates, setRoommates] = useState([]);
  const [newRoommate, setNewRoommate] = useState("");
  const [password, setPassword] = useState("");
  const [newRoommatePasswords, setNewRoommatePasswords] = useState({});
  const [pendingAmounts, setPendingAmounts] = useState({});
  const [additionalAmounts, setAdditionalAmounts] = useState({});
  const [upiId, setUpiId] = useState(user.leaderUpi || "");
  const [additionalTitles, setAdditionalTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [phoneNumbers, setPhoneNumbers] = useState({});
  const [expandedRoommateId, setExpandedRoommateId] = useState(null);

  const handleUpdateUpi = async () => {
    if (!upiId.trim()) {
      alert("Please enter a valid UPI ID");
      return;
    }

    try {
      await axios.patch(`${API_BASE}/api/roommates/${user.id}/upi`, {
        upiId: upiId.trim(),
      });
      alert("✅ UPI ID updated successfully!");
      
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        storedUser.leaderUpi = upiId.trim();
        localStorage.setItem("user", JSON.stringify(storedUser));
      }
    } catch (error) {
      console.error(error);
      alert("Error updating UPI ID: " + (error.response?.data?.message || error.message));
    }
  };

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

  const handlePhoneChange = (roommateId, value) => {
    setPhoneNumbers((prev) => ({
      ...prev,
      [roommateId]: value,
    }));
  };

  const handleUpdatePhone = async (roommateId, roommateName) => {
    const phone = phoneNumbers[roommateId] ?? "";
    try {
      await axios.patch(`${API_BASE}/api/roommates/${roommateId}/phone`, {
        phoneNumber: phone,
      });
      alert(`✅ Saved phone number for ${roommateName}!`);
      fetchRoommates();
    } catch (error) {
      console.error(error);
      alert("Error saving phone number: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSendSMS = (roommate) => {
    const phone = roommate.phoneNumber;
    if (!phone) {
      alert("Please configure a mobile number first!");
      return;
    }

    const upi = upiId || "tkdarshankumar@oksbi";
    const leaderName = user.name || "the leader";

    let extraText = "";
    if (roommate.history && roommate.history.length > 0) {
      const lastItem = roommate.history[roommate.history.length - 1];
      extraText = ` (includes newly added: ${lastItem.title} - Rs ${Number(lastItem.amount).toFixed(2)})`;
    }

    const message = `Hi ${roommate.name}, this is a reminder from ${leaderName}. Your pending balance in Roomie is Rs ${Number(roommate.pendingAmount || 0).toFixed(2)}${extraText}. Please pay using UPI: ${upi}`;

    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
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

      <div
        style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          borderRadius: "16px",
          marginBottom: "2rem",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "0.5rem" }}>💳 Configure UPI Details</h2>
        <p style={{ color: "#bbb", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Set your UPI ID so roommates can pay their pending amounts directly to you using the QR code.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="e.g., yourname@oksbi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            style={{ margin: 0 }}
          />
          <button
            onClick={handleUpdateUpi}
            style={{
              width: "auto",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              border: "none",
              color: "white",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Save UPI ID
          </button>
        </div>
      </div>

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
          {roommates.map((roommate) => {
            const isExpanded = expandedRoommateId === roommate._id;
            return (
              <div
                key={roommate._id}
                style={{
                  padding: "1rem 1.5rem",
                  background: isExpanded 
                    ? "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)" 
                    : "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                  border: isExpanded ? "1px solid rgba(102, 126, 234, 0.4)" : "1px solid rgba(102, 126, 234, 0.15)",
                  borderRadius: "16px",
                  marginBottom: "1.2rem",
                  boxShadow: isExpanded ? "0 10px 30px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.15)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Header Row (Toggles Collapse) */}
                <div
                  onClick={() => setExpandedRoommateId(isExpanded ? null : roommate._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#fff" }}>
                      {roommate.name}
                    </span>
                    <span style={{ color: "#667eea", fontSize: "0.85rem", fontWeight: "bold" }}>
                      {isExpanded ? "▲ Hide Actions" : "▼ Show Actions"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking action buttons
                  >
                    <span style={{ color: "#f5576c", fontWeight: "700" }}>
                      Pending: Rs {Number(roommate.pendingAmount || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteRoommate(roommate._id, roommate.name)}
                      style={{
                        width: "auto",
                        padding: "0.4rem 0.75rem",
                        background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Collapsible Action Content */}
                {isExpanded && (
                  <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.25rem" }}>
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
                        gridTemplateColumns: "1fr auto auto",
                        gap: "0.75rem",
                        alignItems: "center",
                        marginTop: "0.75rem",
                      }}
                    >
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={phoneNumbers[roommate._id] ?? roommate.phoneNumber ?? ""}
                        onChange={(e) => handlePhoneChange(roommate._id, e.target.value)}
                      />
                      <button
                        onClick={() => handleUpdatePhone(roommate._id, roommate.name)}
                        style={{
                          width: "auto",
                          padding: "0.75rem 1rem",
                          whiteSpace: "nowrap",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {roommate.phoneNumber ? "Update Phone" : "Save Phone"}
                      </button>
                      <button
                        onClick={() => handleSendSMS(roommate)}
                        disabled={!roommate.phoneNumber}
                        style={{
                          width: "auto",
                          padding: "0.75rem 1rem",
                          whiteSpace: "nowrap",
                          background: roommate.phoneNumber 
                            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                            : "#4a4a5a",
                          cursor: roommate.phoneNumber ? "pointer" : "not-allowed",
                          opacity: roommate.phoneNumber ? 1 : 0.5,
                        }}
                      >
                        💬 Send SMS
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
                        type="text"
                        placeholder="Amount (- to deduct)"
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RoommateAdmin;
