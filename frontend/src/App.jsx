import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
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