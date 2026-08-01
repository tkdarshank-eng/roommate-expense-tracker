import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import RoommateAdmin from "./pages/RoommateAdmin";
import Expenses from "./pages/Expenses";

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "https://roommate-expense-tracker-tmx2.onrender.com";

function ProtectedAdminRoute({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "leader") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user.role !== "leader") {
    return null;
  }

  return <Admin user={user} />;
}

function ProtectedRoommateRoute({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "leader") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user.role !== "leader") {
    return null;
  }

  return <RoommateAdmin user={user} />;
}

function Navigation({ user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  const fetchNotifications = async () => {
    if (!user || user.role !== "user") return;
    try {
      const response = await axios.get(`${API_BASE}/api/notifications`);
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (user && user.role === "user") {
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleDropdown = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && unreadCount > 0) {
      try {
        await axios.patch(`${API_BASE}/api/notifications/read`);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  };

  return (
    <nav>
      <div className="nav-left">
        <Link to="/">📊 View Expenses</Link>
        {user && user.role === "leader" && (
          <>
            <Link to="/admin">➕ Add Expense</Link>
            <Link to="/roommates">👥 Manage Roommates</Link>
          </>
        )}
      </div>
      <div className="nav-right">
        {user && user.role === "user" && (
          <div style={{ position: "relative", width: "100%", marginBottom: "0.5rem" }}>
            <button
              onClick={toggleDropdown}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: unreadCount > 0 ? "rgba(102, 126, 234, 0.25)" : "rgba(255, 255, 255, 0.05)",
                border: unreadCount > 0 ? "1px solid rgba(102, 126, 234, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                padding: "0.6rem",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
              }}
            >
              🔔 Alerts
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "#ff4757",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    fontWeight: "900",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  bottom: isMobile ? "auto" : "100%",
                  top: isMobile ? "100%" : "auto",
                  left: 0,
                  width: "100%",
                  background: "rgba(30, 30, 50, 0.98)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  zIndex: 1100,
                  maxHeight: "260px",
                  overflowY: "auto",
                  padding: "0.5rem",
                  marginTop: isMobile ? "0.5rem" : "0.5rem",
                  marginBottom: isMobile ? "0" : "0.5rem",
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#c0c0c0",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Recent Alerts</span>
                  <span style={{ cursor: "pointer", color: "#667eea" }} onClick={() => setShowDropdown(false)}>
                    ✕ Close
                  </span>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: "1rem", color: "#888", fontSize: "0.85rem", textAlign: "center" }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        fontSize: "0.8rem",
                        color: n.read ? "#aaa" : "#fff",
                        background: n.read ? "transparent" : "rgba(102, 126, 234, 0.08)",
                        borderRadius: "6px",
                        marginBottom: "4px",
                        lineHeight: "1.3",
                        textAlign: "left"
                      }}
                    >
                      <div>{n.message}</div>
                      <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "4px" }}>
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        <span className="user-info">👤 {user.name} ({user.role})</span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(parsedUser.id);
      if (!isValidObjectId) {
        localStorage.removeItem("user");
        setUser(null);
        delete axios.defaults.headers.common["x-user-id"];
        delete axios.defaults.headers.common["x-user-role"];
        return;
      }
      setUser(parsedUser);
      axios.defaults.headers.common["x-user-id"] = parsedUser.id;
      axios.defaults.headers.common["x-user-role"] = parsedUser.role;
    } else {
      delete axios.defaults.headers.common["x-user-id"];
      delete axios.defaults.headers.common["x-user-role"];
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["x-user-id"] = userData.id;
    axios.defaults.headers.common["x-user-role"] = userData.role;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["x-user-id"];
    delete axios.defaults.headers.common["x-user-role"];
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Navigation user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Expenses user={user} />} />
        <Route path="/admin" element={<ProtectedAdminRoute user={user} />} />
        <Route path="/roommates" element={<ProtectedRoommateRoute user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;