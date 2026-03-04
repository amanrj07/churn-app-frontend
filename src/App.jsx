import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

// SVG Logo (neural network style)
const Logo = () => (
  <svg className="header-logo" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="27" stroke="#2563eb" strokeWidth="2" fill="#0d1b3e"/>
    {/* nodes */}
    <circle cx="14" cy="20" r="3" fill="#4f46e5"/>
    <circle cx="14" cy="36" r="3" fill="#4f46e5"/>
    <circle cx="28" cy="14" r="3" fill="#7c3aed"/>
    <circle cx="28" cy="28" r="3" fill="#2563eb"/>
    <circle cx="28" cy="42" r="3" fill="#7c3aed"/>
    <circle cx="42" cy="20" r="3" fill="#06b6d4"/>
    <circle cx="42" cy="36" r="3" fill="#06b6d4"/>
    {/* edges */}
    <line x1="14" y1="20" x2="28" y2="14" stroke="#4f46e5" strokeWidth="1" opacity="0.7"/>
    <line x1="14" y1="20" x2="28" y2="28" stroke="#4f46e5" strokeWidth="1" opacity="0.7"/>
    <line x1="14" y1="36" x2="28" y2="28" stroke="#4f46e5" strokeWidth="1" opacity="0.7"/>
    <line x1="14" y1="36" x2="28" y2="42" stroke="#4f46e5" strokeWidth="1" opacity="0.7"/>
    <line x1="28" y1="14" x2="42" y2="20" stroke="#7c3aed" strokeWidth="1" opacity="0.7"/>
    <line x1="28" y1="28" x2="42" y2="20" stroke="#2563eb" strokeWidth="1" opacity="0.7"/>
    <line x1="28" y1="28" x2="42" y2="36" stroke="#2563eb" strokeWidth="1" opacity="0.7"/>
    <line x1="28" y1="42" x2="42" y2="36" stroke="#7c3aed" strokeWidth="1" opacity="0.7"/>
    {/* arrow */}
    <path d="M38 44 L48 44 L44 40" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [importances, setImportances] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: parseFloat(v) }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const [predRes, impRes] = await Promise.all([
        axios.post(`${API}/predict`, form),
        axios.get(`${API}/feature-importance`),
      ]);
      setResult(predRes.data);
      setImportances(
        Object.entries(impRes.data.importances).map(([name, value]) => ({
          name, value: parseFloat((value * 100).toFixed(2))
        }))
      );
    } catch {
      setError("Could not connect to the API. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="header">
        <Logo />
        <h1>Churn Predictor</h1>
      </div>

      <div className="app">
        <div className="card">
          <p className="card-title">customer information</p>
          <div className="form-grid">
            {fields.map(f => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                {f.type === "select" ? (
                  <select value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)}>
                    {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : (
                  <input type="number" value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} />
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
            <p className="card-title">prediction result</p>
            <div className={`result-label ${result.churn ? "churn" : "no-churn"}`}>
              {result.label}
            </div>
            <p className="result-prob">Churn Probability: <strong>{result.probability}%</strong></p>
            <div className="prob-bar-bg">
              <div className="prob-bar-fill" style={{
                width: `${result.probability}%`,
                background: result.churn ? "#f87171" : "#4ade80"
              }}/>
            </div>
          </div>
        )}

        {importances && (
          <div className="card">
            <p className="card-title">top 5 churn drivers</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={importances} layout="vertical" margin={{ left: 90 }}>
                <XAxis type="number" tick={{ fill: "#7a9cc4", fontSize: 12 }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fill: "#e2e8f0", fontSize: 12 }} />
                <Tooltip formatter={v => `${v}%`} contentStyle={{ background: "#112254", border: "1px solid #1e3a6e", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {importances.map((_, i) => (
                    <Cell key={i} fill={["#2563eb","#4f46e5","#7c3aed","#06b6d4","#0ea5e9"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
}