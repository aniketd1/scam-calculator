import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes";
import Chatbot from "./components/Chatbot";
import PasswordGate from "./components/Password";
import VoiceAgent from "./components/VoiceAgent";

function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <div className="app-container">
          
          <Navbar />

          <main className="main-content">
            <AppRoutes />
            <VoiceAgent />
          </main>

          <Footer />
          <Chatbot />
        </div>
      </BrowserRouter>
    </PasswordGate>
  );
}

export default App;
