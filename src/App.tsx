// import ChildDashboard from "./pages/child-dashboard";
import FatherDashboard from "./pages/FatherDashboard";
// import GoalsApp from "./pages/goals";
// import TasksApp from "./pages/tasks";
import WelcomePage from "./pages/welcome";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome & Root */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Parent Dashboard */}
        <Route path="/Father-Dashboard" element={<FatherDashboard />} />

        {/* Child Routes - Note: The parameter name must match what you use in ChildDashboard */}
        {/* <Route path="/Child-Dashboard/:id" element={<ChildDashboard />} /> */}

        {/* Tasks & Goals with childId parameter */}
        {/* <Route path="/Child-Tasks/:childId" element={<TasksApp />} /> */}
        {/* <Route path="/Child-Goals/:childId" element={<GoalsApp />} /> */}

        {/* Child Routes - using Navigate with string template */}
        <Route
          path="/Child-Dashboard/:id"
          element={
            <Navigate
              to={`/child-dashboard.html?id=${1}`}
              replace
            />
          }
        />
        <Route
          path="/Child-Tasks/:childId"
          element={
            <Navigate
              to={`/child-tasks.html?id=${window.location.pathname.split("/").pop()}`}
              replace
            />
          }
        />
        <Route
          path="/Child-Goals/:childId"
          element={
            <Navigate
              to={`/child-goals.html?id=${window.location.pathname.split("/").pop()}`}
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
