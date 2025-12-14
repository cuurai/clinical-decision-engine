import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ServiceDetail } from "./components/ServiceDetail";
import { ResourceDetail } from "./components/ResourceDetail";
import { Settings } from "./components/Settings";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <Router basename="/cde">
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/service/:serviceId" element={<ServiceDetail />} />
            <Route path="/service/:serviceId/resource/:resourceId" element={<ResourceDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
