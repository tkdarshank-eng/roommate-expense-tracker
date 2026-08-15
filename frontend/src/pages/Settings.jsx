import { useState } from "react";
import axios from "axios";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:5000`
  : "https://roommate-expense-tracker-tmx2.onrender.com";

function Settings({ user, onLogout }) {
  const [newRoommate, setNewRoommate] = useState("");
  const [password, setPassword] = useState("");
  const [upiId, setUpiId] = useState(user.leaderUpi || "");
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleUpdateUpi = async () => {
    if (!upiId.trim()) {
      alert("Please enter a valid UPI ID");
      return;
    }

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoommate = async () => {
    if (!newRoommate.trim() || !password.trim()) {
      alert("Please enter both roommate name and a password");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/roommates`, {
        name: newRoommate,
        password: password.trim(),
        pendingAmount: 0,
      });

      alert("Roommate added successfully!");
      setNewRoommate("");
      setPassword("");
    } catch (error) {
      console.error("Error details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Error adding roommate";
      alert("Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: "80px" }}>
      <h1>⚙️ Settings</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "-1rem", marginBottom: "1.5rem" }}>
        Configure roommate profiles, QR payment settings, and account options.
      </p>

      {/* UPI Details Card */}
      <div 
        className="card" 
        style={{ 
          background: expandedSection === "upi" ? "rgba(108, 92, 231, 0.08)" : "var(--card-bg)",
          border: expandedSection === "upi" ? "1px solid rgba(108, 92, 231, 0.4)" : "1px solid var(--card-border)",
          transition: "all 0.3s ease" 
        }}
      >
        <div 
          onClick={() => toggleSection("upi")}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>💳 Configure UPI Details</h2>
          <span style={{ color: "var(--accent-purple)", fontWeight: "bold", fontSize: "0.8rem" }}>
            {expandedSection === "upi" ? "▲ Hide" : "▼ Manage"}
          </span>
        </div>

        {expandedSection === "upi" && (
          <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Set your UPI ID so roommates can pay their pending amounts directly to you using the QR code.
            </p>
            <div 
              style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "0.75rem", 
                alignItems: "center" 
              }}
            >
              <input
                type="text"
                placeholder="e.g., yourname@oksbi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                style={{ flex: "1 1 200px", margin: 0 }}
                disabled={loading}
              />
              <button
                onClick={handleUpdateUpi}
                disabled={loading}
                style={{
                  flex: "1 1 auto",
                  width: "auto",
                  padding: "0.75rem 1.5rem",
                  background: "var(--success-gradient)",
                  border: "none",
                  color: "white",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  minHeight: "44px",
                  boxShadow: "0 4px 15px rgba(0, 184, 148, 0.2)"
                }}
              >
                Save UPI ID
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add New Roommate Card */}
      <div 
        className="card"
        style={{ 
          background: expandedSection === "roommate" ? "rgba(108, 92, 231, 0.08)" : "var(--card-bg)",
          border: expandedSection === "roommate" ? "1px solid rgba(108, 92, 231, 0.4)" : "1px solid var(--card-border)",
          transition: "all 0.3s ease" 
        }}
      >
        <div 
          onClick={() => toggleSection("roommate")}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>👥 Add New Roommate</h2>
          <span style={{ color: "var(--accent-purple)", fontWeight: "bold", fontSize: "0.8rem" }}>
            {expandedSection === "roommate" ? "▲ Hide" : "▼ Manage"}
          </span>
        </div>

        {expandedSection === "roommate" && (
          <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Create an account for a new roommate so they can log in and view their balance.
            </p>
            <div className="form-group">
              <label>Roommate Name</label>
              <input
                type="text"
                placeholder="Enter roommate name"
                value={newRoommate}
                onChange={(e) => setNewRoommate(e.target.value)}
                style={{ marginBottom: "1rem" }}
                disabled={loading}
              />
              <label>Password for Roommate</label>
              <input
                type="password"
                placeholder="Enter password for roommate"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button onClick={handleAddRoommate} disabled={loading}>
              Add Roommate
            </button>
          </div>
        )}
      </div>

      {/* Logout Card */}
      <div 
        className="card"
        style={{ 
          background: expandedSection === "logout" ? "rgba(214, 48, 49, 0.05)" : "var(--card-bg)",
          border: expandedSection === "logout" ? "1px solid rgba(214, 48, 49, 0.4)" : "1px solid var(--card-border)",
          transition: "all 0.3s ease" 
        }}
      >
        <div 
          onClick={() => toggleSection("logout")}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>🚪 Session Options</h2>
          <span style={{ color: "var(--accent-pink)", fontWeight: "bold", fontSize: "0.8rem" }}>
            {expandedSection === "logout" ? "▲ Hide" : "▼ Manage"}
          </span>
        </div>

        {expandedSection === "logout" && (
          <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Log out of your active leader session on this device.
            </p>
            <button 
              onClick={onLogout} 
              style={{ 
                background: "var(--danger-gradient)",
                boxShadow: "0 4px 15px rgba(214, 48, 49, 0.25)"
              }}
            >
              Logout Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
