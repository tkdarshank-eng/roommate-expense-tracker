import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import RoommateAdmin from "./pages/RoommateAdmin";
import Expenses from "./pages/Expenses";

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

  return <RoommateAdmin />;
}

function Navigation({ user, onLogout }) {
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
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
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