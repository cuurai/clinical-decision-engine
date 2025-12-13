import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ServiceDetail } from "./components/ServiceDetail";
import { ResourceDetail } from "./components/ResourceDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/service/:serviceId" element={<ServiceDetail />} />
          <Route path="/service/:serviceId/resource/:resourceId" element={<ResourceDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
