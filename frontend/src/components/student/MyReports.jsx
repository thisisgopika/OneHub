import { useEffect, useState } from "react";
import API from "../../api";
import StudentNav from "./StudentNav";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  const fetchReports = async () => {
    try {
      if (!userId) return;

      const url = semester
        ? `/users/${userId}/reports?semester=${semester}`
        : `/users/${userId}/reports`;

      const { data } = await API.get(url);
      setReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 Student Navigation at top */}
      <StudentNav />

      <h2>📊 My Participation Reports</h2>

      {/* Semester Filter */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="semester">Filter by Semester: </label>
        <select
          id="semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">All</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <p>No participation records found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Event Name
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Category
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Registration Date
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.reg_id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {r.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {r.date}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {r.category}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {r.registration_date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
