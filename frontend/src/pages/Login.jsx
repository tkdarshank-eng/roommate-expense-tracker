import { useState } from "react";
import axios from "axios";

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "https://roommate-expense-tracker-tmx2.onrender.com";

function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLeaderRole, setIsLeaderRole] = useState(true);
  const [leaderUsername, setLeaderUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!id || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isLeaderRole && !leaderUsername.trim()) {
      setError("Please enter your Group Leader's username");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/roommates/login`, {
        username: id,
        password,
        leaderUsername: isLeaderRole ? "" : leaderUsername,
      });

      const { id: userId, name, role, leaderName, leaderUpi } = response.data;
      onLogin({ id: userId, name, role, leaderName, leaderUpi });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid ID or Password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterLeader = async () => {
    setError("");

    if (!id || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/roommates/register-leader`, {
        username: id,
        password,
      });
      alert("✅ Leader account created successfully! You can now log in.");
      setIsRegistering(false);
      setPassword("");
      setConfirmPassword("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create leader account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isRegistering ? "👑 Create Leader Account" : "🏠 Roomie"}</h1>

        {!isRegistering && (
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              padding: "4px",
              marginBottom: "1.5rem",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <button
              style={{
                flex: 1,
                background: isLeaderRole ? "#667eea" : "transparent",
                border: "none",
                color: "white",
                padding: "0.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s"
              }}
              onClick={() => {
                setIsLeaderRole(true);
                setError("");
              }}
            >
              👑 Leader
            </button>
            <button
              style={{
                flex: 1,
                background: !isLeaderRole ? "#667eea" : "transparent",
                border: "none",
                color: "white",
                padding: "0.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s"
              }}
              onClick={() => {
                setIsLeaderRole(false);
                setError("");
              }}
            >
              👤 Roommate
            </button>
          </div>
        )}

        {!isLeaderRole && !isRegistering && (
          <div className="form-group">
            <label>Group Leader Username</label>
            <input
              type="text"
              placeholder="Enter leader's username (e.g., Darshan)"
              value={leaderUsername}
              onChange={(e) => setLeaderUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              disabled={loading}
            />
          </div>
        )}

        <div className="form-group">
          <label>
            {isRegistering
              ? "Leader Username"
              : isLeaderRole
              ? "Leader Username"
              : "Your Name"}
          </label>
          <input
            type="text"
            placeholder={
              isRegistering
                ? "e.g., Darshan"
                : isLeaderRole
                ? "e.g., Darshan"
                : "e.g., Sujay"
            }
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              (isRegistering ? handleRegisterLeader() : handleLogin())
            }
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              (isRegistering ? handleRegisterLeader() : handleLogin())
            }
            disabled={loading}
          />
        </div>

        {isRegistering && (
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleRegisterLeader()}
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <div
            className="error-message"
            style={{ color: "#f5576c", marginBottom: "1rem", fontWeight: "600" }}
          >
            {error}
          </div>
        )}

        <button
          onClick={isRegistering ? handleRegisterLeader : handleLogin}
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Processing..." : isRegistering ? "Register as Leader" : "Login"}
        </button>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <span
            style={{
              color: "#667eea",
              cursor: "pointer",
              fontWeight: "600",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isRegistering
              ? "Already have a leader account? Login"
              : "Create Leader Account"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
