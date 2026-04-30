import { useNavigate } from "react-router-dom";
import { Leaf, Users, TrendingUp, Award, ArrowRight } from "lucide-react";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="navbar-container">
          <div className="logo">
            <Leaf className="logo-icon" />
            <div>
              <h1>CRS-YamFarmers</h1>
              <p>Cross River State</p>
            </div>
          </div>
          <div className="nav-links">
            <button
              onClick={() => navigate("/login")}
              className="nav-btn login-btn"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="nav-btn register-btn"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Award className="badge-icon" />
            <span>Official Yam Farmers Tax System</span>
            <p>Designed for the hardworking yam farmers of Cross River State</p>
          </div>

          <h1 className="hero-title">
            Empowering Yam Farmers
            <br />
            <span className="highlight">in Cross River State</span>
          </h1>

          <p className="hero-subtitle">
            A modern, transparent platform for registering yam farmers, tracking
            production, and managing tax seamlessly.
          </p>

          <div className="hero-buttons">
            <button
              onClick={() => navigate("/register")}
              className="cta-button primary"
            >
              Register as Farmer <ArrowRight className="inline ml-2" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="cta-button secondary"
            >
              Login to Dashboard
            </button>
          </div>

          <div className="trust-badges">
            <div className="badge">✅ Government Approved</div>
            <div className="badge">✅ Secure & Transparent</div>
            <div className="badge">✅ Auto Tax Calculation</div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="yam-illustration"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">
          Why Farmers Love CRS-YamFarmers system
        </h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Users />
            </div>
            <h3>Easy Registration</h3>
            <p>
              Register once with your LGA and village details. Get a unique
              Farmer ID instantly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp />
            </div>
            <h3>Track Production</h3>
            <p>
              Record your yam harvest easily. Tax is calculated automatically
              per tonne.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Award />
            </div>
            <h3>Transparent Tax System</h3>
            <p>View your tax due, payments, and outstanding balance anytime.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Join Thousands of Yam Farmers?</h2>
          <p>Create your account today and start managing your farm smarter.</p>
          <button
            onClick={() => navigate("/register")}
            className="cta-button primary large"
          >
            Get Started Now - It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 Cross River State Yam Farmers Tax Management System</p>
      </footer>
    </div>
  );
}
