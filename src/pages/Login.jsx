import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import API from "../config/api";
import { Sprout, User, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/Login.css";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/login", { phone, password });
      login(res.data.token, res.data.user);

      if (res.data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid phone number or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center">
              <Sprout className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1>Cross River State Yam Farmers</h1>
          <p>Login to your account</p>
        </div>

        <div className="login-body">
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="error-box">{error}</div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone Number
              </label>
              <div className="input-wrapper">
                <User className="input-icon" size={22} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={22} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary login-button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-link">
            New farmer? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
