import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Awareness from "./pages/Awareness";
import Calculator from "./pages/Calculator";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Report from "./pages/Report";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/awareness" element={<Awareness />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  );
};

export default AppRoutes;