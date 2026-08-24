import React, { useState } from "react";

// Hardcoded direct link to bypass environment caching completely
const API_URL = "https://railway.app";

const buttons = [
  ["7", "num"], ["8", "num"], ["9", "num"], ["÷", "op"],
  ["4", "num"], ["5", "num"], ["6", "num"], ["×", "op"],
  ["1", "num"], ["2", "num"], ["3", "num"], ["−", "op"],
  ["0", "num"], [".", "num"], ["AC", "ac"], ["=", "eq"]
];

export default function App() {
  const [display, setDisplay] = useState("");
  const [result, setResult] = useState("0");

  const press = async (val) => {
    if (val === "AC") {
      setDisplay("");
      setResult("0");
      return;
    }
    if (val === "=") {
      if (!display) return;
      try {
        const res = await fetch(`${API_URL}/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expression: display })
        });
        const data = await res.json();
        setResult(res.ok ? data.result : "Error");
      } catch {
        setResult("Server Error");
      }
      return;
    }
    setDisplay((prev) => prev + val);
  };

  return (
    <div style={{ background: "#0f172a", color: "#fff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", width: "280px" }}>
        <div style={{ background: "#020617", padding: "15px", borderRadius: "8px", textAlign: "right", marginBottom: "15px" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem", minHeight: "20px" }}>{display || "Ready"}</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{result}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {buttons.map(([label, type]) => (
            <button key={label} onClick={() => press(label)} style={{
              padding: "15px", fontSize: "1.2rem", border: "none", borderRadius: "8px", cursor: "pointer",
              background: type === "eq" ? "#4f46e5" : type === "ac" ? "#e11d48" : type === "op" ? "#334155" : "#475569", color: "#fff"
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

