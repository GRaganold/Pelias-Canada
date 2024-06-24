import  { useState } from "react";
import "./TopNav.css"; // Assuming you have a separate CSS file for styles
import { Link } from "react-router-dom";

const TopNav = () => {
  const [responsive, setResponsive] = useState(false);

  const handleToggle = () => {
    setResponsive(!responsive);
  };

  return (
    <div className={`topnav ${responsive ? "responsive" : ""}`} id="myTopnav">
      <div className="left">
        <Link to="/home" style={{ fontWeight: "bold", fontSize: "25px" }}>
          Pelias Geocoder
        </Link>
      </div>
      <div className="right">
        <Link to="/home">Home</Link>
        <Link to="/bulkinput">Bulk Input</Link>
        <div className="dropdown">
          <button className="dropbtn">
            Developers <i className="fa fa-caret-down"></i>
          </button>
          <div className="dropdown-content">
            <Link to="/rshinyapi">RShiny Api</Link>
            <Link to="/pythonapi">Python Api</Link>           
          </div>
        </div>
      </div>
      <div>

      <a href="javascript:void(0);" className="icon" onClick={handleToggle}>
        &#9776;
      </a>
      </div>
    </div>
  );
};

export default TopNav;
