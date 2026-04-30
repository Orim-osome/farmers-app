import { Leaf, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-logo"
          onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
        >
          <div className="logo-icon">
            <Leaf className="w-6 h-6" />
          </div>
          <div className="logo-text">
            <h1>CRS-YamFarmers</h1>
            <p>Cross River State</p>
          </div>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <p className="user-name">{user?.fullName}</p>
            <p className="user-role">
              {isAdmin
                ? "Administrator"
                : `Farmer ID: ${user?.farmerId || "N/A"}`}
            </p>
          </div>

          <button onClick={logout} className="logout-button">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
