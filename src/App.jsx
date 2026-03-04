import { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const API = "https://churn-app-backend.onrender.com";

const defaultForm = {
  gender: 1, SeniorCitizen: 0, Partner: 1, Dependents: 0,
  tenure: 12, PhoneService: 1, MultipleLines: 0,
  InternetService: 1, OnlineSecurity: 0, OnlineBackup: 0,
  DeviceProtection: 0, TechSupport: 0, StreamingTV: 0,
  StreamingMovies: 0, Contract: 0, PaperlessBilling: 1,
  PaymentMethod: 2, MonthlyCharges: 65.0, TotalCharges: 780.0,
};

const fields = [
  { key: "gender", label: "Gender", type: "select", options: [{ v: 0, l: "Female" }, { v: 1, l: "Male" }] },
  { key: "SeniorCitizen", label: "Senior Citizen", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "Partner", label: "Partner", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "Dependents", label: "Dependents", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "tenure", label: "Tenure (months)", type: "number" },
  { key: "Contract", label: "Contract Type", type: "select", options: [{ v: 0, l: "Month-to-Month" }, { v: 1, l: "One Year" }, { v: 2, l: "Two Year" }] },
  { key: "InternetService", label: "Internet Service", type: "select", options: [{ v: 0, l: "DSL" }, { v: 1, l: "Fiber Optic" }, { v: 2, l: "None" }] },
  { key: "PaymentMethod", label: "Payment Method", type: "select", options: [{ v: 0, l: "Bank Transfer" }, { v: 1, l: "Credit Card" }, { v: 2, l: "Electronic Check" }, { v: 3, l: "Mailed Check" }] },
  { key: "PaperlessBilling", label: "Paperless Billing", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "PhoneService", label: "Phone Service", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "OnlineSecurity", label: "Online Security", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "TechSupport", label: "Tech Support", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "StreamingTV", label: "Streaming TV", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "StreamingMovies", label: "Streaming Movies", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "MonthlyCharges", label: "Monthly Charges ($)", type: "number" },
  { key: "TotalCharges", label: "Total Charges ($)", type: "number" },
  { key: "MultipleLines", label: "Multiple Lines", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "OnlineBackup", label: "Online Backup", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
  { key: "DeviceProtection", label: "Device Protection", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }] },
];

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [importances, setImportances] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (k, v) =>
    setForm(prev => ({ ...prev, [k]: parseFloat(v) }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const [predRes, impRes] = await Promise.all([
        axios.post(`${API}/predict`, form),
        axios.get(`${API}/feature-importance`),
      ]);
      setResult(predRes.data);
      const imp = impRes.data.importances;
      setImportances(
        Object.entries(imp).map(([name, value]) => ({
          name, value: parseFloat((value * 100).toFixed(2))
        }))
      );
    } catch {
      setError("Could not connect to the API. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>🔮 Churn Predictor</h1>
      <p className="subtitle">Enter customer details to predict churn probability</p>

      <div className="card">
        <h2>Customer Information</h2>
        <div className="form-grid">
          {fields.map(f => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)}>
                  {f.options.map(o => (
                    <option key={o.v} value={o.v}>{o.l}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={form[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Analyzing..." : "Predict Churn →"}
        </button>
      </div>

      {error && <div className="error">⚠️ {error}</div>}

      {result && (
        <div className="card result-card">
          <h2>Prediction Result</h2>
          <div className={`result-label ${result.churn ? "churn" : "no-churn"}`}>
            {result.label}
          </div>
          <p className="result-prob">Churn Probability: <strong>{result.probability}%</strong></p>
          <div className="prob-bar-bg">
            <div
              className="prob-bar-fill"
              style={{
                width: `${result.probability}%`,
                background: result.churn ? "#f87171" : "#4ade80"
              }}
            />
          </div>
        </div>
      )}

      {importances && (
        <div className="card">
          <h2>Top 5 Churn Drivers</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={importances} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fill: "#e2e8f0", fontSize: 12 }} />
              <Tooltip formatter={v => `${v}%`} contentStyle={{ background: "#1e293b", border: "none" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {importances.map((_, i) => (
                  <Cell key={i} fill={["#38bdf8","#818cf8","#fb7185","#34d399","#fbbf24"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}