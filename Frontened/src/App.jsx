import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import GovernmentDashboard from "./pages/Governmentdashboard";
import Register from "./pages/Register";
import AssignedChallenges from "./pages/AssignedChallenges";


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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
