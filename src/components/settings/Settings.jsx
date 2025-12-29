import React from "react";
import "./settings.css";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Data } from "../../App";

const Settings = () => {
  const { selected, setSelected } = useContext(Data);
  useEffect(() => {
    setSelected("settings");
  }, []);
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const handleSaveProfile = async () => {
    if (!profile.password) {
      alert("Password cannot be empty");
      return;
    }
    if (!profile.firstname) {
      alert("firstname cant empty");
      return;
    }
    if (!profile.lastname) {
      alert("lastname cant empty");
      return;
    }
    if (profile.password != profile.confirmpassword) {
      alert("password and confirm password differ");
      return;
    }
    await axios.post("https://finalprojectbackend-u5cq.onrender.com/api/admin/", {
      firstname: profile.firstname,
      lastname: profile.lastname,
      email: profile.email,
      password: profile.password,
    });
    console.log(profile);
  };

  const getProfile = async () => {
    const response = await axios.get("https://finalprojectbackend-u5cq.onrender.com/api/admin/");
    setProfile({
      firstname: response.data[0].firstname ?? "jkkk",
      lastname: response.data[0].lastname ?? "",
      email: response.data[0].email ?? "",
      password: response.data[0].password ?? "",
      confirmpassword: response.data[0].password ?? "",
    });
    console.log(response.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    console.log(profile);
  };
  
  return (
    <div className="settings">
      <div className="board-top">

      </div>

      <div className="board-hr"></div>

      <div className="settings-body">
        <div className="rem section">
          <Link to="/dashboard">Home</Link>
          <span> {">"} </span>Settings
        </div>

        <div className="settings-table">
          <div className="edit-text">Edit Profile</div>
          <div className="edit-hr"></div>
          <div className="edit-underline"></div>
          <div className="profile-table">
            <div>
              <div className="label poppins">First name</div>
              <input
                className="profile-input"
                name="firstname"
                value={profile.firstname}
                onChange={handleChange}
                type="text"
              />
            </div>
            <div>
              <div className="label poppins">Last name</div>
              <input
                className="profile-input"
                name="lastname"
                value={profile.lastname}
                onChange={handleChange}
                type="text"
              />
            </div>
            <div>
              <div className="label poppins">Email</div>
              <input
                className="profile-input"
                name="email"
                value={profile.email}
                type="text"
                readOnly
              />
            </div>
            <div>
              <div className="label poppins">Password</div>
              <input
                className="profile-input"
                name="password"
                value={profile.password}
                onChange={handleChange}
                type="password"
              />
            </div>
            <div>
              <div className="label poppins">Confirm Password</div>
              <input
                className="profile-input"
                name="confirmpassword"
                value={profile.confirmpassword}
                onChange={handleChange}
                type="password"
              />
            </div>

            <div onClick={handleSaveProfile} className="save-btn poppins">
              Save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
