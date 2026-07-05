import { useState } from "react";

function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!id || !password) {
      setError("Please fill in both fields");
      return;
    }

    // Leader credentials
    if (id === "Darshan" && password === "Darshan123") {
      onLogin({ id, name: "Darshan", role: "leader" });
      return;
    }

    // Other roommates: id = name, password = name+321
    if (password === id + "321") {
      onLogin({ id, name: id, role: "user" });
      return;
    }

    setError("Invalid ID or Password");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏠 Roommate Expense Tracker</h1>
        
        <div className="form-group">
          <label>User ID</label>
          <input
            type="text"
            placeholder="e.g., Darshan or your name"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleLogin} className="login-btn">
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
