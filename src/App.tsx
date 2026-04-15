import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HomeLayout } from "./layouts/HomeLayout";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<HomeLayout><DashboardPage /></HomeLayout>} />
      </Routes>
    </Router>
  );
}

export default App;