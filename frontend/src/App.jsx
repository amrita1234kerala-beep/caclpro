import { useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://railway.app";

const buttons = [
  ["sin", "function"], ["cos", "function"], ["tan", "function"], ["√", "function"], ["^", "operator"],
  ["7", "number"], ["8", "number"], ["9", "number"], ["÷", "operator"], ["⌫", "action"],
  ["4", "number"], ["5", "number"], ["6", "number"], ["×", "operator"], ["(", "operator"],
  ["1", "number"], ["2", "number"], ["3", "number"], ["−", "operator"], [")", "operator"],
  ["0", "number"], [".", "number"], ["%", "operator"], ["+", "operator"], ["=", "equals"],
];

const functionMap = {
  sin: "sin(",
  cos: "cos(",
  tan: "tan(",
  "√": "sqrt(",
};

function App() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const prettyExpression = useMemo(
    () => expression || "Ready to calculate",
    [expression]
  );

  const calculate = async () => {
    if (!expression.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Calculation failed.");
      }

      setDisplay(data.result);
      setHistory((items) => [
        { expression, result: data.result },
        ...items,
      ].slice(0, 8));
      setExpression(data.result);
    } catch (err) {
      setError(err.message || "Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const press = (value) => {
    setError("");

    if (value === "=") {
      calculate();
      return;
    }

    if (value === "⌫") {
      setExpression((current) => current.slice(0, -1));
      return;
    }

    if (value === "AC") {
      setExpression("");
      setDisplay("0");
      setError("");
      return;
    }

    if (value === "sin" || value === "cos" || value === "tan" || value === "√") {
      setExpression((current) => current + functionMap[value]);
      return;
    }

    if (value === "π") {
      setExpression((current) => current + "pi");
      return;
    }

    if (value === "e") {
      setExpression((current) => current + "e");
      return;
    }

    setExpression((current) => current + value);
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">∑</div>
          <div>
            <h1>CalcPro</h1>
            <p>Full-stack scientific calculator</p>
          </div>
        </div>
        <div className="status">
          <span className="status-dot" />
          Python API connected
        </div>
      </header>

      <main className="layout">
        <section className="calculator card">
          <div className="display">
            <div className="expression">{prettyExpression}</div>
            <div className="result">{loading ? "…" : display}</div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="keypad">
            <button className="clear" onClick={() => press("AC")}>AC</button>
            <button className="function" onClick={() => press("π")}>π</button>
            <button className="function" onClick={() => press("e")}>e</button>
            <button className="function" onClick={() => press("log(")}>log</button>
            <button className="function" onClick={() => press("ln(")}>ln</button>

            {buttons.map(([label, type], index) => (
              <button
                key={`${label}-${index}`}
                className={`${type} ${label === "=" ? "equals" : ""}`}
                onClick={() => press(label)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hint">
            <span>Tip</span> Use parentheses for functions, e.g. <code>sin(pi/2)</code>
          </div>
        </section>

        <aside className="history card">
          <div className="history-head">
            <div>
              <h2>History</h2>
              <p>Your recent calculations</p>
            </div>
            <button className="clear-history" onClick={clearHistory}>Clear</button>
          </div>

          {history.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">⌁</div>
              <strong>No calculations yet</strong>
              <span>Your results will appear here.</span>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <button
                  className="history-item"
                  key={`${item.expression}-${index}`}
                  onClick={() => {
                    setExpression(item.expression);
                    setDisplay(item.result);
                  }}
                >
                  <span>{item.expression}</span>
                  <strong>= {item.result}</strong>
                </button>
              ))}
            </div>
          )}
        </aside>
      </main>

      <footer>
        <span>CalcPro</span>
        <span>React frontend · FastAPI backend</span>
      </footer>
    </div>
  );
}

export default App;
