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
      <h1>💰 Add New Expense</h1>

      <div className="form-group">
        <label>Expense Title</label>
        <input
          type="text"
          placeholder="e.g., Rent, Groceries, etc."
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

      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload Bill / Receipt (Optional)</label>
        <input
          id="bill-file-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{
            display: "block",
            width: "100%",
            padding: "0.5rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            color: "#ccc",
            cursor: "pointer",
          }}
        />
        {compressing && <p style={{ fontSize: "0.85rem", color: "#f093fb", marginTop: "0.5rem" }}>⏳ Compressing image...</p>}
        {billImage && (
          <div style={{ marginTop: "1rem", position: "relative", display: "inline-block" }}>
            <img
              src={billImage}
              alt="Bill Preview"
              style={{
                maxWidth: "150px",
                maxHeight: "150px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
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
                top: "-8px",
                right: "-8px",
                background: "#f5576c",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                fontSize: "0.75rem",
                lineHeight: "24px",
                padding: "0",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <button onClick={addExpense}>
        ✨ Add Expense
      </button>
    </div>
  );
}

export default Admin; 
