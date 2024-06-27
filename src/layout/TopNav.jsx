import  { useState, useEffect, useRef } from "react";
import "./TopNav.css";
import { Link, NavLink } from "react-router-dom";

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const lastMenuItemRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("no-scroll", "menu-open");
    } else {
      document.body.classList.remove("no-scroll", "menu-open");
    }
    return () => {
      document.body.classList.remove("no-scroll", "menu-open");
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFocusOut = (event) => {
    if (!menuRef.current.contains(event.relatedTarget)) {
      setMenuOpen(false);
    }
  };

  const handleKeyDownInDropdown = (event) => {
    if (event.key === "Tab" && !event.shiftKey && event.target === lastMenuItemRef.current) {
      setDropdownOpen(false);
    }
  };

  return (
    <nav>
      <div className="body">
        <Link to="/" className="title">
          Pelias Geocoder
        </Link>
        <div
          className="menu"
          onClick={handleMenuToggle}
          onKeyPress={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handleMenuToggle();
            }
          }}
          role="button"
          tabIndex="0"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul className={menuOpen ? "open" : ""} ref={menuRef} onBlur={handleFocusOut} tabIndex="-1">
          <li>
            <NavLink to="/home" tabIndex="0" className="active-exclude">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/bulk-input">Bulk Input</NavLink>
          </li>
          <li className="dropdown">
            <button
              onClick={handleDropdownToggle}
              className={`dropdown-button ${dropdownOpen ? "active" : ""}`}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              Developers
            </button>
            <ul
              className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}
              onKeyDown={handleKeyDownInDropdown}
              onBlur={() => {}}
            >
              <li>
                <Link to="/r-shiny-api">R Shiny Api</Link>
              </li>
              <li>
                <Link to="/python-api" ref={lastMenuItemRef}>
                  Python Api
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <NavLink to="/frequently-asked-questions" tabIndex="0" ref={lastMenuItemRef}>
              Frequently Asked Questions
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
