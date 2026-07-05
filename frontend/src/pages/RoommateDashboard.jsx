import React from "react";
import QRCode from "react-qr-code";

function RoommateDashboard() {
  // Temporary value (Later we'll fetch from MongoDB)
  const pendingAmount = 1250;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#fff",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#4f46e5" }}>
          Roommate Dashboard
        </h1>

        <h3>Welcome 👋</h3>

        <hr />

        <h2
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          Pending Amount
        </h2>

        <h1
          style={{
            fontSize: "45px",
            color: "#16a34a",
          }}
        >
          ₹{pendingAmount}
        </h1>

        <p
          style={{
            fontWeight: "bold",
            marginTop: "20px",
          }}
        >
          Scan to Pay
        </p>

        <div
          style={{
            background: "white",
            padding: "15px",
            display: "inline-block",
          }}
        >
          <QRCode
            size={220}
            value={`upi://pay?pa=tkdarshankumar@oksbi&pn=Darshan&am=${pendingAmount}&cu=INR`}
          />
        </div>

        <h3 style={{ marginTop: "20px" }}>
          Pay To
        </h3>

        <p>
          <strong>Darshan</strong>
        </p>

        <p>
          tkdarshankumar@oksbi
        </p>

        <button
          style={{
            marginTop: "25px",
            padding: "12px 30px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
          onClick={() => alert("Payment request sent to Leader")}
        >
          I've Paid
        </button>
      </div>
    </div>
  );
}

export default RoommateDashboard;