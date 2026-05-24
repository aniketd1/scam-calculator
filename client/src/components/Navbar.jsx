import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2 className="logo">Scam Risk Calculator</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/calculator">Calculator</Link>
        <Link to="/awareness">Awareness</Link>
        <Link to="/report">Report</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
};

export default Navbar;