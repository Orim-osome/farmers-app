import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../config/api";
import {
  Sprout,
  User,
  Phone,
  Mail,
  MapPin,
  Ruler,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import "../styles/Register.css";

const lgaVillages = {
  Akamkpa: ["Mbarakom", "Ikot Uba", "Aningeje", "Uwet"],
  Akpabuyo: ["Ikot Nakanda", "Ikot Eyo", "Atabong"],
  Bakassi: ["Abana", "Ekpot Abia", "Archibong"],
  Bekwarra: ["Abuochiche", "Gakem", "Betukwe"],
  Biase: ["Akpet", "Utu", "Ehom"],
  Boki: ["Boje", "Bateriko", "Okwangwo"],
  "Calabar Municipal": ["Calabar", "Duke Town", "Henshaw Town"],
  "Calabar South": ["Anantigha", "Essien Town", "Big Qua"],
  Etung: ["Effraya", "Ikom", "Bendeghe"],
  Ikom: ["Ikom", "Nkim", "Nkarara"],
  Obanliku: ["Sankwala", "Bendi", "Bebi"],
  Obubra: ["Obubra", "Yala", "Osopong"],
  Obudu: ["Obudu", "Betta", "Gakem"],
  Odukpani: ["Odukpani", "Ikot Nakanda", "Ita"],
  Ogoja: ["Ogoja", "Ishibori", "Mbube"],
  Ugep: ["Ugep", "Ikom", "Adim"],
  Yakurr: ["Ugep", "Afafanyi", "Nko"],
  Yala: ["Yala", "Okpoma", "Ijegu"],
};

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    lga: "",
    village: "",
    farmSizeHa: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const availableVillages = useMemo(() => {
    return formData.lga ? lgaVillages[formData.lga] || [] : [];
  }, [formData.lga]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "lga") {
      setFormData((prev) => ({ ...prev, village: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/register", {
        ...formData,
        farmSizeHa: formData.farmSizeHa
          ? parseFloat(formData.farmSizeHa)
          : null,
      });
      alert("✅ Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center">
              <Sprout className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1>Cross River State Yam Farmers</h1>
          <p>Register as a Yam Farmer</p>
        </div>

        <div className="register-body">
          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {error && <div className="error-message">{error}</div>}

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <div className="input-wrapper">
                <User className="input-icon" size={22} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone Number
              </label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={22} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={22} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  LGA
                </label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={22} />
                  <select name="lga" onChange={handleChange} required>
                    <option value="">Select LGA</option>
                    {Object.keys(lgaVillages).map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Village / Community
                </label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={22} />
                  <select
                    name="village"
                    onChange={handleChange}
                    required
                    disabled={!formData.lga}
                  >
                    <option value="">Select Village</option>
                    {availableVillages.map((village) => (
                      <option key={village} value={village}>
                        {village}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Farm Size in Hectares
              </label>
              <div className="input-wrapper">
                <Ruler className="input-icon" size={22} />
                <input
                  type="number"
                  name="farmSizeHa"
                  placeholder="Farm Size in Hectares"
                  step="0.1"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Create Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={22} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create Password"
                    onChange={handleChange}
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

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={22} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="eye-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={22} />
                    ) : (
                      <Eye size={22} />
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary register-button"
            >
              {loading ? "Creating Account..." : "Register as Yam Farmer"}
            </button>
          </form>

          <p className="register-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
