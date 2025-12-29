import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Dashboard from "./components/dashboard/Dashboard";
import Leads from "./components/leads/Leads";
import Employees from "./components/employees/Employees";
import Settings from "./components/settings/Settings";
import Navbar from "./components/navbar/Navbar";
import { useState, createContext } from "react";
// eslint-disable-next-line react-refresh/only-export-components
export const Data = createContext();

function App() {
  const [selected, setSelected] = useState(null);
  return (
    <Router>
      <Data.Provider value={{ selected, setSelected }}>
        <div className="app">
          <Navbar />
          <div className="body">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </Data.Provider>
    </Router>
  );
}

export default App;
