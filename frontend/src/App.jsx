import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import RoommateAdmin from "./pages/RoommateAdmin";
import Expenses from "./pages/Expenses";
import MonthlyExpenses from "./pages/MonthlyExpenses";

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "https://roommate-expense-tracker-tmx2.onrender.com";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
  const notifiedIdsRef = useRef(new Set());
  const location = useLocation();
  const currentPath = location.pathname;

  const fetchNotifications = async () => {
    if (!user || user.role !== "user") return;
    try {
      const response = await axios.get(`${API_BASE}/api/notifications`);
      const fetchedNotifications = response.data;

      if ("Notification" in window && Notification.permission === "granted") {
        const isFirstLoad = notifiedIdsRef.current.size === 0;

        fetchedNotifications.forEach((n) => {
          if (!n.read && !notifiedIdsRef.current.has(n._id)) {
            notifiedIdsRef.current.add(n._id);
            
            if (!isFirstLoad) {
              new Notification("Roomie Alert 🏠", {
                body: n.message,
                icon: "/favicon.png",
                tag: n._id,
              });
            }
          }
        });
      }

      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const registerPush = async () => {
    if (!user || user.role !== "user" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered with scope:", registration.scope);

      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const res = await axios.get(`${API_BASE}/api/notifications/vapid-public-key`);
        const vapidPublicKey = res.data.publicKey;

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      await axios.post(`${API_BASE}/api/roommates/subscribe`, subscription);
      console.log("Registered for W3C Web Push successfully!");
    } catch (err) {
      console.error("Failed to register Web Push:", err);
    }
  };

  useEffect(() => {
    if (user && user.role === "user") {
      registerPush();
      
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (user && user.role === "user") {
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
    <>
      {/* Desktop Sidebar Navigation */}
      <nav>
        <div className="nav-left">
          <Link to="/" className={currentPath === "/" ? "active" : ""}>📊 View Expenses</Link>
          {user && user.role === "user" && (
            <Link to="/monthly-expenses" className={currentPath === "/monthly-expenses" ? "active" : ""}>📅 Monthly Expenses</Link>
          )}
          {user && user.role === "leader" && (
            <>
              <Link to="/admin" className={currentPath === "/admin" ? "active" : ""}>➕ Add Expense</Link>
              <Link to="/roommates" className={currentPath === "/roommates" ? "active" : ""}>👥 Manage Roommates</Link>
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
                  background: unreadCount > 0 ? "rgba(108, 92, 231, 0.25)" : "rgba(255, 255, 255, 0.05)",
                  border: unreadCount > 0 ? "1px solid rgba(108, 92, 231, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
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
                    bottom: "100%",
                    left: 0,
                    width: "100%",
                    background: "rgba(30, 30, 50, 0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(108, 92, 231, 0.2)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                    zIndex: 1100,
                    maxHeight: "260px",
                    overflowY: "auto",
                    padding: "0.5rem",
                    marginBottom: "0.5rem",
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
                    <span style={{ cursor: "pointer", color: "#6c5ce7" }} onClick={() => setShowDropdown(false)}>
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
                          background: n.read ? "transparent" : "rgba(108, 92, 231, 0.08)",
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

      {/* Mobile Top Header */}
      <div className="mobile-top-header">
        <span className="mobile-brand-title">🏠 Roomie</span>
        <div className="mobile-top-actions">
          {user && user.role === "user" && (
            <button
              onClick={toggleDropdown}
              style={{
                background: unreadCount > 0 ? "rgba(108, 92, 231, 0.2)" : "rgba(255, 255, 255, 0.05)",
                border: unreadCount > 0 ? "1px solid rgba(108, 92, 231, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
                padding: "0.4rem 0.8rem",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                minHeight: "36px",
                width: "auto",
                boxShadow: "none",
              }}
            >
              🔔 Alerts
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "#ff4757",
                    color: "white",
                    fontSize: "0.7rem",
                    padding: "1px 5px",
                    borderRadius: "10px",
                    fontWeight: "900",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          {user && user.role === "leader" && (
            <span style={{ fontSize: "0.85rem", opacity: 0.8, color: "var(--accent-pink)", fontWeight: "600" }}>
              👑 {user.name}
            </span>
          )}
        </div>

        {/* Mobile Alerts Dropdown */}
        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "10px",
              right: "10px",
              background: "rgba(18, 18, 30, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(108, 92, 231, 0.2)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              zIndex: 1300,
              maxHeight: "260px",
              overflowY: "auto",
              padding: "0.5rem",
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
              <span style={{ cursor: "pointer", color: "#6c5ce7" }} onClick={() => setShowDropdown(false)}>
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
                    background: n.read ? "transparent" : "rgba(108, 92, 231, 0.08)",
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

      {/* Mobile Bottom Navigation Bar (For Leaders) */}
      {user && user.role === "leader" && (
        <div className="mobile-bottom-bar">
          <Link to="/" className={`mobile-nav-link ${currentPath === "/" ? "active" : ""}`}>
            <span className="mobile-nav-icon">📊</span>
            <span>Expenses</span>
          </Link>
          <Link to="/admin" className={`mobile-nav-link ${currentPath === "/admin" ? "active" : ""}`}>
            <span className="mobile-nav-icon">➕</span>
            <span>Add</span>
          </Link>
          <Link to="/roommates" className={`mobile-nav-link ${currentPath === "/roommates" ? "active" : ""}`}>
            <span className="mobile-nav-icon">👥</span>
            <span>Roommates</span>
          </Link>
          <div 
            onClick={onLogout} 
            className="mobile-nav-link" 
            style={{ cursor: "pointer" }}
          >
            <span className="mobile-nav-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (For Roommates / Non-leaders) */}
      {user && user.role === "user" && (
        <div className="mobile-bottom-bar">
          <Link to="/" className={`mobile-nav-link ${currentPath === "/" ? "active" : ""}`}>
            <span className="mobile-nav-icon">📊</span>
            <span>Expenses</span>
          </Link>
          <Link to="/monthly-expenses" className={`mobile-nav-link ${currentPath === "/monthly-expenses" ? "active" : ""}`}>
            <span className="mobile-nav-icon">🗓️</span>
            <span>Monthly</span>
          </Link>
          <div 
            onClick={toggleDropdown}
            className={`mobile-nav-link ${showDropdown ? "active" : ""}`}
            style={{ cursor: "pointer" }}
          >
            <span className="mobile-nav-icon">🔔</span>
            <span style={{ position: "relative" }}>
              Alerts
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-12px",
                    background: "#ff4757",
                    color: "white",
                    fontSize: "0.6rem",
                    padding: "1px 4px",
                    borderRadius: "8px",
                    fontWeight: "900",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
          </div>
          <div 
            onClick={onLogout} 
            className="mobile-nav-link" 
            style={{ cursor: "pointer", color: "var(--accent-pink)" }}
          >
            <span className="mobile-nav-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      )}
    </>
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
        <Route path="/monthly-expenses" element={<MonthlyExpenses user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;