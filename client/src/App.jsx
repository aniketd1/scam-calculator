import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        
        <Navbar />

        <main className="main-content">
          <AppRoutes />
        </main>

        <Footer />
        <Chatbot />
      </div>
    </BrowserRouter>
  );
}

export default App;