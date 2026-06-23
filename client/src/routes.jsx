import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Awareness from "./pages/Awareness";
import Calculator from "./pages/Calculator";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Report from "./pages/Report";
import Auth from "./pages/Auth";
import VerifiedIndex from './pages/Verification';
import Maintenance from "./pages/Maintenance";
import SignIn from "./pages/SignIn";
import ResetPassword from "./pages/ResetPassword";

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
      <Route path="/auth" element={<Auth />} />
      <Route path="/verified" element={<VerifiedIndex />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;
