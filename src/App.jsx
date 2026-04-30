import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-900 text-white">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/" />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/dashboard" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute>
              <FarmerDashboard />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              // <ProtectedRoute adminOnly>
              <AdminDashboard />
              // </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
