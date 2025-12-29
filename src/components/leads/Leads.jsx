import React, { useState, useEffect, useContext } from "react";
import "./leads.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Data } from "../../App";

const Leads = () => {
  const MAX_CSV_ROWS = 1000;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const { setSelected } = useContext(Data);
  useEffect(() => {
    setSelected("leads");
  }, []);

  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 11;
  const [searchTerm, setSearchTerm] = useState("");
  const [addType, setAddType] = useState(null);

  const [lead, setLead] = useState({
    name: "",
    email: "",
    source: "",
    date: "",
    location: "",
    preferredlanguage: "",
  });

  const getLeads = async (page = 1, search = "") => {
    console.log("hello");

    const res = await axios.get("https://finalprojectbackend-u5cq.onrender.com/api/leads", {
      params: {
        page,
        limit: recordsPerPage,
        search,
      },
    });

    setLeads(res.data.data);
    setTotalLeads(res.data.total);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getLeads(currentPage, searchTerm);
  }, [currentPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLead({ ...lead, [name]: value });
  };

  const parseAndValidateDate = (value) => {
    // Accept: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = new Date(value);
      return isNaN(d) ? null : d;
    }
    // Accept: MM-DD-YYYY or MM/DD/YYYY
    const match = value.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (match) {
      const [, mm, dd, yyyy] = match;
      const d = new Date(`${yyyy}-${mm}-${dd}`);
      return isNaN(d) ? null : d;
    }
    return null;
  };

  const handleSaveLead = async () => {
    const parsedDate = parseAndValidateDate(lead.date);
    if (!parsedDate) {
      alert("Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD");
      return;
    }
    if (!regex.test(lead.email)) {
      alert("Please enter a valid email address" + lead.email);
      return;
    }
    console.log(lead);
    try {
      await axios.post("https://finalprojectbackend-u5cq.onrender.com/api/leads", lead);
      setLead({
        name: "",
        email: "",
        source: "",
        date: "",
        location: "",
        preferredlanguage: "",
      });
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Something went wrong";
      alert(message);
      return;
    }
    setAddType(null);
    getLeads(1, searchTerm);
  };

  // pagination
  const npage = Math.ceil(totalLeads / recordsPerPage);
  const prePage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const nextPage = () => currentPage < npage && setCurrentPage((p) => p + 1);
  const getPageNumbers = () => {
    if (npage <= 7) {
      return Array.from({ length: npage }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", npage - 2, npage - 1, npage];
    }
    if (currentPage >= npage - 2) {
      return [npage - 4, npage - 3, npage - 2, npage - 1, npage];
    }
    return [
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      npage - 2,
      npage - 1,
      npage,
    ];
  };

  // csv upload
  const [csvData, setCsvData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleFile = (file) => {
    console.log(file);
    try {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean);
        const headers = rows[0].split(",");

        const data = rows.slice(1).map((row) => {
          const values = row.split(",");
          let obj = {};
          headers.forEach((h, i) => {
            obj[h.trim()] = values[i]?.trim();
          });
          return obj;
        });
        setCsvData(data);
      };
      reader.readAsText(file);
    } catch (err) {
      console.log(err);
    }
  };

  const normalizeDate = (value) => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts[0].length === 4) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const handleUpload = async () => {
    if (!csvData.length) {
      alert("No data to upload");
      return;
    }
    if (csvData.length > MAX_CSV_ROWS) {
      alert(`Only ${MAX_CSV_ROWS} rows are allowed`);
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        if (!regex.test(row.email)) {
          alert("Please enter a valid email address");
          return;
        }
        await axios.post("https://finalprojectbackend-u5cq.onrender.com/api/leads", {
          name: row.name,
          email: row.email,
          source: row.source,
          date: normalizeDate(row.date),
          location: row.location,
          preferredlanguage: row.preferredlanguage,
        });
        const percent = Math.round(((i + 1) / csvData.length) * 100);
        setProgress(percent);
      }

      setTimeout(() => {
        setUploading(false);
        setAddType(null);
        setProgress(0);
        getLeads(1, searchTerm);
        alert("CSV upload completed");
      }, 400);
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert("Upload failed.");
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    getLeads(1, searchTerm);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      getLeads(1, searchTerm);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="board">
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
            type="text"
            className="board-input"
            placeholder="Search here..."
            // name="searchTerm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="board-hr"></div>

      <div className="leads-body">
        <div className="leads-section">
          <div className="rem">
            <Link to="/dashboard">Home</Link> {" > "} Leads
          </div>
          <div className="add-section">
            <span onClick={() => setAddType("manual")} className="add-butoon">
              Add Manually
            </span>
            <span onClick={() => setAddType("csv")} className="add-butoon">
              Add CSV
            </span>
          </div>
        </div>

        <div className="leads-table">
          <div className="leads-table-head">
            <span>No.</span>
            <span>Name</span>
            <span className="leads-email">Email</span>
            <span>Source</span>
            <span>Date</span>
            <span>Location</span>
            <span>Language</span>
            <span>Assigned To</span>
            <span>Status</span>
            <span>Type</span>
            <span>Scheduled Date</span>
          </div>

          <div className="leads-line rem"></div>

          {leads &&
            leads.map((l, i) => (
              // {filteredLeads.map((l, i) => (
              <div key={l._id} className="leads-row">
                <span>{(currentPage - 1) * recordsPerPage + i + 1}</span>
                <span>{l.name}</span>
                <span className="leads-email">{l.email}</span>
                <span>{l.source}</span>
                <span>{new Date(l.date).toLocaleDateString()}</span>
                <span>{l.location}</span>
                <span>{l.preferredlanguage}</span>
                <span>
                  {l.assignedto ? "#" + l.assignedto.slice(-14) : "-"}
                </span>
                <span>{l.status || "Ongoing"}</span>
                <span>{l.type || "Warm"}</span>
                <span>
                  {l.scheduleddate == null
                    ? "-"
                    : new Date(l.scheduleddate).toLocaleDateString() || "-"}
                </span>
              </div>
            ))}

          {addType === "manual" && (
            <div className="add-new-lead">
              <div className="add-text">
                <span>Add New Lead </span>
                <span>
                  <img
                    onClick={() => setAddType(null)}
                    className="close"
                    src="./close.png"
                    alt=""
                  />
                </span>
              </div>
              <div>
                <div className="label poppins">Name</div>
                <input
                  className="lead-input"
                  name="name"
                  value={lead.name}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Email</div>
                <input
                  className="lead-input"
                  name="email"
                  value={lead.email}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Source</div>
                <input
                  className="lead-input"
                  name="source"
                  value={lead.source}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Date</div>
                <input
                  className="lead-input"
                  name="date"
                  value={lead.date}
                  onChange={handleChange}
                  type="text"
                  placeholder="MM-DD-YYYY or MM/DD/YYYY"
                />
              </div>
              <div>
                <div className="label poppins">Location</div>
                <input
                  className="lead-input"
                  name="location"
                  value={lead.location}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <div className="label poppins">Preferred Language</div>
                <input
                  className="lead-input"
                  name="preferredlanguage"
                  value={lead.preferredlanguage}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div onClick={handleSaveLead} className="save-btn poppins">
                Save
              </div>
            </div>
          )}

          {addType === "csv" && (
            <div className="csv-modal">
              <div className="csv-box">
                <div className="csv-header">
                  <div>
                    <b>CSV Upload</b>
                    <div className="csv-sub">Add your documents here</div>
                  </div>
                  <span className="csv-close" onClick={() => setAddType(null)}>
                    ✕
                  </span>
                </div>

                <div
                  className={`csv-drop ${dragActive ? "drag-active" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    handleFile(file);
                  }}
                >
                  {uploading ? (
                    <div className="progress-box">
                      <div className="progress-circle">
                        <svg width="80" height="80">
                          <circle cx="40" cy="40" r="34" />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            style={{
                              strokeDashoffset: 213 - (213 * progress) / 100,
                            }}
                          />
                        </svg>
                        <div className="progress-text">{progress}%</div>
                      </div>
                      <div className="verifying">Verifying...</div>
                      <button className="cancel">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="csv-icon">
                        <img src="./upload.png" alt="" />
                      </div>
                      <div>Drag your file(s) to start uploading</div>

                      <div className="csv-or-line">
                        <span className="csv-side-line"></span>
                        <span className="csv-or-text">OR</span>
                        <span className="csv-side-line"></span>
                      </div>

                      <label className="csv-browse">
                        Browse files
                        <input
                          type="file"
                          accept=".csv"
                          hidden
                          onChange={(e) => handleFile(e.target.files[0])}
                        />
                      </label>

                      <div className="csv-sample">
                        <span>Sample File.csv</span>
                        <a href="/leads_sample.csv" download>
                          <img
                            src="./download.png"
                            className="csv-download"
                            alt="download"
                          />
                        </a>
                      </div>
                    </>
                  )}
                </div>

                <div className="csv-footer">
                  <button className="cancel" onClick={() => setAddType(null)}>
                    Cancel
                  </button>
                  <button className="csv-next" onClick={handleUpload}>
                    Next <img src="./chevron_right.png" alt="" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* pagination */}
          <div className="pagination-container-leads">
            <button className="pagi-btn" onClick={prePage}>
              <img className="arrow" src="./arrow-left.png" alt="" />
              Previous
            </button>
            <div className="page-numbers">
              {getPageNumbers().map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} className="page-dots">
                    ...
                  </span>
                ) : (
                  <span
                    key={`page-${n}-${i}`}
                    className={`page-item ${
                      currentPage === n ? "active-page" : ""
                    }`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </span>
                )
              )}
            </div>
            <button className="pagi-btn" onClick={nextPage}>
              Next
              <img className="arrow" src="./arrow-right.png" alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
