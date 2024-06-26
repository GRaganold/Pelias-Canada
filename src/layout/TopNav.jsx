import { useState, useRef } from "react";
import "./TopNav.css"; // Assuming you have a separate CSS file for styles
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa"; 

const TopNav = () => {
  const [responsive, setResponsive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = (event) => {
    event.preventDefault(); // Prevent the default anchor behavior
    setResponsive(!responsive);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDropdownToggle();
    }
  };

  const handleBlur = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.relatedTarget)) {
      setDropdownOpen(false);
    }
  };

  return (
    <nav className={`topnav ${responsive ? "responsive" : ""}`} id="myTopnav" aria-label="Main Navigation">
      <div className="left">
        <Link to="/home" style={{ fontWeight: "bold", fontSize: "25px" }}>
          Pelias Geocoder
        </Link>
      </div>
      <div className="right">
        <Link to="/home">Home</Link>
        <Link to="/bulkinput">Bulk Input</Link>
        <div className="dropdown" ref={dropdownRef} onBlur={handleBlur}>
          <button
            className="dropbtn"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            onClick={handleDropdownToggle}
            onKeyDown={handleKeyDown}
          >
            Developers <i className="fa fa-caret-down" aria-hidden="true"><FaChevronDown size="15px"/></i>
          </button>
          <div
            className="dropdown-content"
            aria-label="submenu"
            style={{ display: dropdownOpen ? 'block' : 'none' }}
          >
            <Link to="/rshinyapi">RShiny Api</Link>
            <Link to="/pythonapi">Python Api</Link>
          </div>
        </div>
      </div>
      <div>
        <button
          className="icon"
          onClick={handleToggle}
          aria-label="Toggle navigation"
          aria-controls="myTopnav"
          aria-expanded={responsive}
        >
          &#9776;
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
