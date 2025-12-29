import { useEffect, useContext, useState } from "react";
import "./dashboard.css";
import { Link } from "react-router-dom";
import { Data } from "../../App";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const { setSelected } = useContext(Data);
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const getEmployees = async (search = "") => {
    const res = await axios.get("https://finalprojectbackend-u5cq.onrender.com/api/employees/all", {
      params: {
        search,
      },
    });
    setEmployees(res.data);
  };
  const [leads, setLeads] = useState([]);

  const getLeads = async () => {
    const res = await axios.get("https://finalprojectbackend-u5cq.onrender.com/api/leads/all");
    setLeads(res.data);
  };
  useEffect(() => {
    setSelected("dashboard");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getEmployees(searchTerm);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getLeads();
  }, []);

  const unassignedLeads = leads.filter((l) => !l.assignedto).length;
  const assignedThisWeek = leads.filter((l) => {
    if (!l.assignedto) return false; 
    const assignedDate = new Date(l.assignedat);
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return assignedDate >= weekAgo && assignedDate <= now;
  }).length;
  const activeSalespeople = employees.filter(
    (e) => e.status !== "inactive"
  ).length;
  const closedLeads = leads.filter((l) => l.status === "Closed").length;
  const conversionRate = leads.length
    ? Math.round((closedLeads / leads.length) * 100)
    : 0;

  const handleSearch = async () => {
    getEmployees(searchTerm);
  };

  // chart-2
  const getLast14Days = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };
  const last14Days = getLast14Days();
  const chartLabels = last14Days.map((d) =>
    d.toLocaleDateString("en-US", { weekday: "short" })
  );

  const chartValues = last14Days.map((day) => {
    const assigned = leads.filter((l) => {
      const ad = new Date(l.assignedat || l.date);
      const normalize = (d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      return normalize(ad) === normalize(day);
    });
    const closed = assigned.filter((l) => l.status === "Closed");
    if (assigned.length === 0) return 0;
    return Math.round((closed.length / assigned.length) * 100);
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: "#d6d6d6",
        borderRadius: 10,
        barThickness: 22,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#7a7a7a",
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...chartValues, 10),
        ticks: {
          stepSize: 10,
          callback: (v) => v + "%",
          color: "#7a7a7a",
          font: { size: 11 },
        },
        grid: {
          borderDash: [4, 4],
          color: "#dadada",
          drawBorder: false,
          drawOnChartArea: true,
        },
      },
    },
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      getEmployees(searchTerm);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const [activities, setActivities] = useState([]);
  const getActivities = async () => {
    const res = await axios.get(`https://finalprojectbackend-u5cq.onrender.com/api/admin-activity/`);
    setActivities(res.data);

  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getActivities();
  }, []);
  const timeAgo = (date) => {
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
    return `${Math.floor(diff / 86400)} day ago`;
  };
  return (
    <div className="dashboard">
      <div className="board-top">
        <div className="searchbar">
          <img
            onClick={handleSearch}
            className="lens"
            src="./lens.png"
            alt=""
          />
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="board-input"
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="board-hr"></div>

      <div className="dashboard-body">
        <div className="rem section">
          <Link to="/dashboard">Home</Link>
          <span> {">"} </span>Dashboard
        </div>

        <div className="charts">
          <div className="chart-1">
            <div className="widget-1 chart-1-1">
              <div className="img-container">
                <img className="payments" src="./payments.png" alt="" />
              </div>
              <span>
                <div className="ul-text">Unassigned Leads</div>
                <div className="ul">{unassignedLeads}</div>
              </span>
            </div>
            <div className="widget-1 chart-1-2">
              <div className="img-container">
                <img className="payments" src="./person.png" alt="" />
              </div>
              <span>
                <div className="ul-text">Assigned This Week</div>
                <div className="ul">{assignedThisWeek}</div>
              </span>
            </div>
            <div className="widget-1 chart-1-3">
              <div className="img-container">
                <img className="payments" src="./handshake.png" alt="" />
              </div>
              <span>
                <div className="ul-text">Active Salespeople</div>
                <div className="ul">{activeSalespeople}</div>
              </span>
            </div>
            <div className="widget-1 chart-1-4">
              <div className="img-container">
                <img className="payments" src="./readiness.png" alt="" />
              </div>
              <span>
                <div className="ul-text">Conversion Rate</div>
                <div className="ul">{conversionRate}%</div>
              </span>
            </div>
          </div>

          <div className="chart-2">
            <div className="widget-2 chart-2-1">
              <div className="chart-2-1-heading">Sale Analytics</div>
              <div className="chart-2-1-graph">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
            <div className="widget-2 chart-2-2">
              <div className="chart-2-2-heading">Recent Activity Feed</div>
              <div className="chart-2-2-data">
                {activities.map((item) => (
                  <div key={item._id} className="rem activity-feed-row">
                    <div className="activity-feed-message">
                      • {item.message} - {timeAgo(item.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-3">
            <div className="dash-table-head">
              <span>Name</span>
              <span>Employee ID</span>
              <span>Assignment Leads</span>
              <span>Closed Leads</span>
              <span>Status</span>
            </div>
            <div className="employee-contaner">
              {employees.map((item) => (
                <div>
                  <div key={item._id} className="employee-lines-dash">
                    <div className="initials">{item.initials}</div>
                    <div className="employee-name">
                      <div className="name">
                        {item.firstname} {item.lastname}
                      </div>
                      <div className="email">{item.email}</div>
                    </div>
                    <div className="employees-id">
                      #{item._id ? item._id.slice(-10).toUpperCase() : "N/A"}
                    </div>
                    <div>{item.assignedleads || 0}</div>
                    <div>{item.closedleads || 0}</div>
                    <div>
                      <span
                        className={`status ${
                          item.status === "inactive" ? "inactive" : "active"
                        }`}
                      >
                        <span style={{ marginRight: "4px" }}>●</span>
                        {item.status || "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="dash-hr"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
