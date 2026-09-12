import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import Register from "./pages/Register";
import AssignedChallenges from "./pages/AssignedChallenges";
import GovernmentLayout from './pages/government/GovernmentLayout';
import GovtKpiOverview from './pages/government/GovtKpiOverview';
import GovernmentChallenges from './pages/government/GovernmentChallenges';
import GovernmentProposals from './pages/government/GovernmentProposals';
import GovernmentProjects from './pages/government/GovernmentProjects';


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Token nahi hai toh user Login page par jayega
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/government-dashboard"
          element={
            <ProtectedRoute>
              <GovernmentDashboard />
            </ProtectedRoute>
          }
        />

         <Route path="/register" element={<Register />} />
         <Route path="/assigned-challenges" element={<AssignedChallenges />} />

 
        <Route path="*" element={<Navigate to="/" replace />} />
        
        {/* /Inside your <Routes>: */}
      <Route path="/government" element={<GovernmentLayout />}>
         <Route index element={<GovtKpiOverview />} />
          <Route path="dashboard" element={<GovtKpiOverview />} />    
        <Route index element={<GovernmentChallenges />} />
        <Route path="dashboard" element={<GovernmentChallenges />} />
        <Route path="challenges" element={<GovernmentChallenges />} />
        <Route path="proposals" element={<GovernmentProposals />} />
        <Route path="projects" element={<div className="p-6 bg-white rounded-xl">Project Milestones View</div>} />
        <Route path="projects" element={<GovernmentProjects />} />
      </Route>


      </Routes>
    </BrowserRouter>
  );
}

export default App;
