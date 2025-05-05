import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const severityLevels = {
  "Minimal": 1,
  "Mild": 2,
  "Moderate": 3,
  "Severe": 4
};

const severityLabels = ["Minimal", "Mild", "Moderate", "Severe"];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchUser();
      fetchAssessmentHistory();
    }
  }, [navigate, token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("http://localhost:5001/api/auth/profile", {
        headers: { Authorization: token },
      });
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchAssessmentHistory = async () => {
    try {
      const { data } = await axios.get("http://localhost:5001/api/assessments/", {
        headers: { Authorization: token },
      });
      setHistory(data);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
    }
  };

  // Format data for the chart
  const chartData = history.map(item => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    depression: severityLevels[item.depressionSeverity] || 0,
    anxiety: severityLevels[item.anxietySeverity] || 0
  }));

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg text-center">
        <h2>Welcome, {user ? user.name : "User"}!</h2>
        <p>Track your mental health progress over time.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/assessment")}>
          Start Self-Assessment
        </button>
      </div>

      <div className="card mt-4 p-4 shadow">
        <h3 className="text-center">Assessment Result Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              yAxisId="left"
              domain={[1, 4]}
              tickFormatter={(value) => severityLabels[value - 1]}
              tickCount={4}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[1, 4]}
              tickFormatter={(value) => severityLabels[value - 1]}
              tickCount={4}
            />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="depression"
              stroke="#8884d8"
              name="Depression Severity"
              dot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="anxiety"
              stroke="#82ca9d"
              name="Anxiety Severity"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
