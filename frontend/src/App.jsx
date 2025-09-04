import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/health") // goes through vite proxy → backend
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() =>
        setStatus({ frontend: true, backend: false, database: false })
      );
  }, []);

  if (!status) return <p>Checking connections...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🚀 OneHub Frontend</h1>
      <h2>System Status</h2>
      <p>Frontend: ✅ Running</p>
      <p>Backend: {status.backend ? "✅ Connected" : "❌ Failed"}</p>
      <p>Database: {status.database ? "✅ Connected" : "❌ Failed"}</p>
      {status.db_time && <p>DB Time: {status.db_time}</p>}
      {status.error && <p style={{ color: "red" }}>Error: {status.error}</p>}
    </div>
  );
}

export default App;
