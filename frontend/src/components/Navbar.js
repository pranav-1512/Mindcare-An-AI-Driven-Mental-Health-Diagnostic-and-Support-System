import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useState, useRef, useEffect } from "react";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [showJournalDropdown, setShowJournalDropdown] = useState(false);
  const [showAssessmentDropdown, setShowAssessmentDropdown] = useState(false);
  const journalDropdownRef = useRef(null);
  const assessmentDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check Journal dropdown
      if (journalDropdownRef.current && !journalDropdownRef.current.contains(event.target)) {
        setShowJournalDropdown(false);
      }
      
      // Check Assessment dropdown
      if (assessmentDropdownRef.current && !assessmentDropdownRef.current.contains(event.target)) {
        setShowAssessmentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navbarStyle = {
    background: "linear-gradient(90deg, #4a148c 0%, #7b1fa2 100%)",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
  };

  const brandStyle = {
    fontWeight: "bold",
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

  const navLinkStyle = {
    color: "white",
    margin: "0 5px",
    fontWeight: "500",
    transition: "all 0.3s ease"
  };

  const dropdownStyle = {
    position: "absolute",
    right: 0,
    top: "100%",
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-in-out",
    minWidth: "200px"
  };

  const dropdownItemStyle = {
    display: "block",
    padding: "10px 15px",
    color: "#333",
    textDecoration: "none",
    transition: "all 0.2s ease"
  };

  const dropdownItemHoverStyle = {
    backgroundColor: "#f8f9fa",
    color: "#7b1fa2"
  };

  const logoutBtnStyle = {
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "4px",
    color: "white",
    padding: "8px 16px",
    transition: "all 0.3s ease",
    fontWeight: "500"
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={navbarStyle}>
      <div className="container">
        <Link className="navbar-brand" to="/" style={brandStyle}>
          <i className="bi bi-heart-pulse me-2"></i>
          MindCare
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/" style={navLinkStyle}>
                    Home
                  </Link>
                </li>

                {/* Assessment Dropdown */}
                <li className="nav-item dropdown" ref={assessmentDropdownRef}>
                  <a 
                    className={`nav-link dropdown-toggle ${showAssessmentDropdown ? 'show' : ''}`} 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAssessmentDropdown(!showAssessmentDropdown);
                      setShowJournalDropdown(false); // Close other dropdown
                    }}
                    style={navLinkStyle}
                  >
                    Assessment
                  </a>
                  
                  {showAssessmentDropdown && (
                    <div className="dropdown-menu show" style={dropdownStyle}>
                      <Link 
                        className="dropdown-item" 
                        to="/assessment" 
                        onClick={() => setShowAssessmentDropdown(false)}
                        style={dropdownItemStyle}
                        onMouseOver={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemHoverStyle[key];
                          }
                        }}
                        onMouseOut={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemStyle[key] || "";
                          }
                        }}
                      >
                        Take Assessment
                      </Link>
                      <Link 
                        className="dropdown-item" 
                        to="/assessment-history" 
                        onClick={() => setShowAssessmentDropdown(false)}
                        style={dropdownItemStyle}
                        onMouseOver={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemHoverStyle[key];
                          }
                        }}
                        onMouseOut={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemStyle[key] || "";
                          }
                        }}
                      >
                        Assessments Result History
                      </Link>
                    </div>
                  )}
                </li>

                {/* Journal Dropdown */}
                <li className="nav-item dropdown" ref={journalDropdownRef}>
                  <a 
                    className={`nav-link dropdown-toggle ${showJournalDropdown ? 'show' : ''}`} 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowJournalDropdown(!showJournalDropdown);
                      setShowAssessmentDropdown(false); // Close other dropdown
                    }}
                    style={navLinkStyle}
                  >
                    Journals
                  </a>
                  
                  {showJournalDropdown && (
                    <div className="dropdown-menu show" style={dropdownStyle}>
                      <Link 
                        className="dropdown-item" 
                        to="/journals" 
                        onClick={() => setShowJournalDropdown(false)}
                        style={dropdownItemStyle}
                        onMouseOver={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemHoverStyle[key];
                          }
                        }}
                        onMouseOut={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemStyle[key] || "";
                          }
                        }}
                      >
                        View Journals
                      </Link>
                      <Link 
                        className="dropdown-item" 
                        to="/journals/add" 
                        onClick={() => setShowJournalDropdown(false)}
                        style={dropdownItemStyle}
                        onMouseOver={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemHoverStyle[key];
                          }
                        }}
                        onMouseOut={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemStyle[key] || "";
                          }
                        }}
                      >
                        Add New Journal
                      </Link>
                      <Link 
                        className="dropdown-item" 
                        to="/journals/progress" 
                        onClick={() => setShowJournalDropdown(false)}
                        style={dropdownItemStyle}
                        onMouseOver={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemHoverStyle[key];
                          }
                        }}
                        onMouseOut={(e) => {
                          for (const key in dropdownItemHoverStyle) {
                            e.currentTarget.style[key] = dropdownItemStyle[key] || "";
                          }
                        }}
                      >
                        Journal Progress
                      </Link>
                    </div>
                  )}
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/analysis" style={navLinkStyle}>
                    Analysis
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/resources" style={navLinkStyle}>
                    Resources
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/profile" style={navLinkStyle}>
                    <FaUser style={{ marginRight: "8px" }} /> Profile
                  </Link>
                </li>
                
                <li className="nav-item ms-2">
                  <button 
                    className="btn" 
                    onClick={handleLogout}
                    style={logoutBtnStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#c82333";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc3545";
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" style={navLinkStyle}>
                    Login
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className="nav-link btn btn-light text-purple ms-2" 
                    to="/register"
                    style={{
                      color: "#7b1fa2",
                      fontWeight: "500",
                      padding: "8px 16px",
                      backgroundColor: "white",
                      borderRadius: "4px"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .navbar-dark .navbar-nav .nav-link {
            color: rgba(255, 255, 255, 0.9);
          }
          
          .navbar-dark .navbar-nav .nav-link:hover {
            color: white;
            transform: translateY(-2px);
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;