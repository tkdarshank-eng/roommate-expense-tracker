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

function Admin({ user }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [roommates, setRoommates] = useState([]);
  const [billImage, setBillImage] = useState("");
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/roommates`)
      .then((res) => setRoommates(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1200;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        setBillImage(base64);
        setCompressing(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = (err) => {
      console.error(err);
      setCompressing(false);
      alert("Error reading image file");
    };
    reader.readAsDataURL(file);
  };

  const addExpense = async () => {
    if (!title || !amount || !paidBy) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/expenses`, {
        title,
        amount: Number(amount),
        paidBy,
        billImage,
      });

      alert("✅ Expense Added Successfully!");

      setTitle("");
      setAmount("");
      setPaidBy("");
      setBillImage("");
      // Reset input element
      const fileInput = document.getElementById("bill-file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.log(error);
      alert("Error adding expense");
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h1>💰 Add New Expense</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "-1rem", marginBottom: "1.5rem" }}>
          Record a new shared expense. It will be split equally among all roommates.
        </p>

        <div className="form-group">
          <label>Expense Title</label>
          <input
            type="text"
            placeholder="e.g., Rent, Groceries, Electricity"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Select Who Paid</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Choose a roommate...</option>
            <option value={user.name}>{user.name} (Leader)</option>
            {roommates.map((roommate) => (
              <option
                key={roommate._id}
                value={roommate.name}
              >
                {roommate.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: "2rem" }}>
          <label>Upload Bill / Receipt (Optional)</label>
          <label 
            htmlFor="bill-file-input" 
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              background: "rgba(255, 255, 255, 0.01)",
              border: "1.5px dashed rgba(108, 92, 231, 0.3)",
              borderRadius: "14px",
              color: "#b2bec3",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.25s ease",
              marginTop: "0.5rem"
            }}
          >
            <span style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>📁</span>
            <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "#fff" }}>Click to upload receipt</span>
            <span style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.25rem" }}>JPG, PNG (max 5MB)</span>
          </label>
          <input
            id="bill-file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {compressing && <p style={{ fontSize: "0.85rem", color: "#f093fb", marginTop: "0.5rem", textAlign: "center" }}>⏳ Compressing image...</p>}
          {billImage && (
            <div style={{ marginTop: "1.25rem", textAlign: "center", position: "relative", display: "inline-block" }}>
              <img
                src={billImage}
                alt="Bill Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                }}
              />
              <button
                onClick={() => {
                  setBillImage("");
                  const fileInput = document.getElementById("bill-file-input");
                  if (fileInput) fileInput.value = "";
                }}
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  background: "#f5576c",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  minHeight: "auto",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  lineHeight: "28px",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <button onClick={addExpense} style={{ height: "46px" }}>
          ✨ Add Expense
        </button>
      </div>
    </div>
  );
}

export default Admin; 
