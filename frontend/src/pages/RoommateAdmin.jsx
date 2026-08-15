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
  const [newRoommatePasswords, setNewRoommatePasswords] = useState({});
  const [pendingAmounts, setPendingAmounts] = useState({});
  const [additionalAmounts, setAdditionalAmounts] = useState({});
  const [additionalTitles, setAdditionalTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [phoneNumbers, setPhoneNumbers] = useState({});
  const [expandedRoommateId, setExpandedRoommateId] = useState(null);

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

    const upi = user.leaderUpi || "tkdarshankumar@oksbi";
    const leaderName = user.name || "the leader";

    let extraText = "";
    if (roommate.history && roommate.history.length > 0) {
      const lastItem = roommate.history[roommate.history.length - 1];
      extraText = ` (includes newly added: ${lastItem.title} - Rs ${Number(lastItem.amount).toFixed(2)})`;
    }

    const message = `Hi ${roommate.name}, this is a reminder from ${leaderName}. Your pending balance in Roomie is Rs ${Number(roommate.pendingAmount || 0).toFixed(2)}${extraText}. Please pay using UPI: ${upi}`;

    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  };

  const handleSendWhatsApp = (roommate) => {
    const phone = roommate.phoneNumber;
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    const targetPhone = cleanPhone && cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const upi = user.leaderUpi || "tkdarshankumar@oksbi";

    let balancesText = roommates
      .map((r) => `- ${r.name}: Rs ${Number(r.pendingAmount || 0).toFixed(2)}`)
      .join("\n");

    const message = `Hi ${roommate.name}! 🏠\n\nHere is the current Roomie expense summary:\n${balancesText}\n\nUPI ID for payments: ${upi}\n\nThank you!`;

    const whatsappUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
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
    <div className="container" style={{ paddingBottom: "80px" }}>
      <h1>Manage Roommates</h1>
      <h2 style={{ marginTop: "1rem", color: "var(--accent-purple)" }}>Pending Amounts</h2>

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
                  padding: "1.2rem",
                  background: isExpanded 
                    ? "linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(224, 86, 253, 0.1) 100%)" 
                    : "rgba(22, 22, 40, 0.6)",
                  border: isExpanded ? "1px solid rgba(108, 92, 231, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fff" }}>
                      {roommate.name}
                    </span>
                    <span style={{ color: "var(--accent-purple)", fontSize: "0.8rem", fontWeight: "bold" }}>
                      {isExpanded ? "▲ Hide" : "▼ Actions"}
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
                    <span style={{ color: "var(--accent-pink)", fontWeight: "800", fontSize: "0.95rem" }}>
                      Rs {Number(roommate.pendingAmount || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteRoommate(roommate._id, roommate.name)}
                      className="delete-btn"
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
                          background: "rgba(0, 184, 148, 0.15)",
                          border: "1px solid rgba(0, 184, 148, 0.3)",
                          padding: "1rem",
                          borderRadius: "12px",
                          marginBottom: "1.25rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ color: "#00b894", fontWeight: "700", fontSize: "0.85rem" }}>
                          ⚠️ {roommate.name} has submitted a payment request!
                        </span>
                        <button
                          onClick={() => handleApprovePayment(roommate._id, roommate.name)}
                          style={{
                            width: "auto",
                            padding: "0.5rem 1rem",
                            background: "var(--success-gradient)",
                            border: "none",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            minHeight: "36px",
                            boxShadow: "0 4px 10px rgba(0, 184, 148, 0.2)"
                          }}
                        >
                          Approve (Reset to 0)
                        </button>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
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
                        style={{ flex: "1 1 150px" }}
                      />
                      <button
                        onClick={() => handleUpdatePendingAmount(roommate._id, roommate.name)}
                        style={{
                          flex: "1 1 auto",
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
                        display: "flex",
                        flexWrap: "wrap",
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
                        style={{ flex: "1 1 100%" }}
                      />
                      <button
                        onClick={() => handleUpdatePhone(roommate._id, roommate.name)}
                        style={{
                          flex: "1 1 120px",
                          width: "auto",
                          padding: "0.75rem 1rem",
                          whiteSpace: "nowrap",
                          background: "var(--accent-gradient-purple)",
                        }}
                      >
                        {roommate.phoneNumber ? "Update Phone" : "Save Phone"}
                      </button>
                      <button
                        onClick={() => handleSendSMS(roommate)}
                        disabled={!roommate.phoneNumber}
                        style={{
                          flex: "1 1 120px",
                          width: "auto",
                          padding: "0.75rem 1rem",
                          whiteSpace: "nowrap",
                          background: roommate.phoneNumber 
                            ? "linear-gradient(135deg, #00b894 0%, #00cec9 100%)" 
                            : "#2e2e40",
                          cursor: roommate.phoneNumber ? "pointer" : "not-allowed",
                          opacity: roommate.phoneNumber ? 1 : 0.5,
                          boxShadow: roommate.phoneNumber ? "0 4px 15px rgba(0, 184, 148, 0.2)" : "none"
                        }}
                      >
                        💬 Send SMS
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      <button
                        onClick={() => handleSendWhatsApp(roommate)}
                        style={{
                          flex: "1 1 100%",
                          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                          color: "#fff",
                          fontWeight: "700",
                          boxShadow: "0 4px 15px rgba(37, 211, 102, 0.25)",
                        }}
                      >
                        💬 Send on WhatsApp
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
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
                        style={{ flex: "1 1 150px" }}
                      />
                      <button
                        onClick={() => handleUpdatePassword(roommate._id, roommate.name)}
                        style={{
                          flex: "1 1 auto",
                          width: "auto",
                          padding: "0.75rem 1rem",
                          whiteSpace: "nowrap",
                          background: "var(--accent-gradient-pink)",
                        }}
                      >
                        Change Password
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
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
                        style={{ flex: "1 1 130px" }}
                      />
                      <input
                        type="text"
                        placeholder="Amount (- to deduct)"
                        value={additionalAmounts[roommate._id] ?? ""}
                        onChange={(e) => handleAdditionalAmountChange(roommate._id, e.target.value)}
                        style={{ flex: "1 1 130px" }}
                      />
                      <button
                        onClick={() => handleAddPendingAmount(roommate._id, roommate.name)}
                        style={{
                          flex: "1 1 100%",
                          background: "var(--success-gradient)",
                          boxShadow: "0 4px 15px rgba(0, 184, 148, 0.25)"
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
                          background: "rgba(10, 10, 20, 0.4)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "12px",
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--accent-purple)", fontWeight: "700" }}>
                          Pending Amount Breakdown:
                        </strong>
                        <ul style={{ margin: "0", paddingLeft: "1.2rem" }}>
                          {roommate.history.map((item, idx) => (
                            <li key={item._id || idx} style={{ marginBottom: "0.4rem" }}>
                              <span style={{ fontWeight: "700" }}>{item.title}</span>: 
                              <span style={{ color: item.amount < 0 ? "#ff7675" : "#00b894", marginLeft: "4px", fontWeight: "700" }}>
                                {item.amount < 0 ? "" : "+"}₹{Number(item.amount).toFixed(2)}
                              </span>{" "}
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "4px" }}>
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
