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
        {/* التوجيه التلقائي */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* المسار الأبوي (Layout) */}
        <Route element={<HomeLayout children={<DashboardPage />} />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* أي مسارات إضافية ستظهر هنا تلقائياً داخل الـ Layout */}
          {/* <Route path="/reports" element={<ReportsPage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
