import React from "react";
import "./navbar.css";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Data } from "../../App";

const Navbar = () => {
  const { selected, setSelected } = useContext(Data);
  useEffect(() => {
    setSelected("dashboard");
  }, []);

  const handleSelectItem = (value) => {
    setSelected(value);
    localStorage.setItem("selected", value);

  };
  useEffect(() => {
    const saved = localStorage.getItem("selected");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(saved);
    }
  }, []);

  useEffect(() => {}, [selected]);

  return (
    <div className="navbar">
      <div className="title">
        Canova<span className="crm">CRM</span>
      </div>
      <div className="hr"></div>
      <ul className="navlist">
        <Link to="/dashboard">
          <li
            onClick={() => handleSelectItem("dashboard")}
            className={`navitem ${
              selected === "dashboard" ? "selected-nav" : ""
            }`}
          >
            Dashboard
          </li>
        </Link>
        <Link to="/leads">
          <li
            onClick={() => handleSelectItem("leads")}
            value="leads"
            className={`navitem ${selected === "leads" ? "selected-nav" : ""}`}
          >
            Leads
          </li>
        </Link>
        <Link to="/employees">
          <li
            onClick={() => handleSelectItem("employees")}
            value="employees"
            className={`navitem ${
              selected === "employees" ? "selected-nav" : ""
            }`}
          >
            Employees
          </li>
        </Link>
        <Link to="/settings">
          <li
            onClick={() => handleSelectItem("settings")}
            value="settings"
            className={`navitem ${
              selected === "settings" ? "selected-nav" : ""
            }`}
          >
            Settings
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Navbar;
