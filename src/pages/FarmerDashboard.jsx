import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../config/api";
import {
  Leaf,
  Plus,
  Wallet,
  TrendingUp,
  Calendar,
  CreditCard,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "../styles/FarmerDashboard.css";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [productions, setProductions] = useState([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    season: "Main",
    productionTonnes: "",
  });
  const [paymentData, setPaymentData] = useState({
    productionId: "",
    amount: "",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const res = await API.get("/production");
      setProductions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductionSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productionTonnes) return;

    setLoading(true);
    setMessage("");

    try {
      await API.post("/production", {
        year: formData.year,
        season: formData.season,
        productionTonnes: parseFloat(formData.productionTonnes),
      });
      setMessage("✅ Production recorded successfully!");
      setFormData({
        year: new Date().getFullYear(),
        season: "Main",
        productionTonnes: "",
      });
      fetchProductions();
    } catch (err) {
      setMessage("❌ Failed to record production.");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (production) => {
    setPaymentData({
      productionId: production.id,
      amount: production.taxDue,
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) return;

    setLoading(true);
    try {
      const autoReference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await API.post("/payment", {
        productionId: paymentData.productionId,
        amount: parseFloat(paymentData.amount),
        reference: autoReference,
      });
      setMessage("✅ Payment recorded successfully!");
      setShowPaymentModal(false);
      fetchProductions();
    } catch (err) {
      setMessage("❌ Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  const totalProduction = productions.reduce(
    (sum, p) => sum + Number(p.productionTonnes || 0),
    0,
  );
  const totalTaxDue = productions.reduce(
    (sum, p) => sum + Number(p.taxDue || 0),
    0,
  );
  const totalPaid = productions.reduce(
    (sum, p) =>
      sum + p.payments.reduce((ps, pay) => ps + Number(pay.amount || 0), 0),
    0,
  );
  const outstanding = totalTaxDue - totalPaid;

  return (
    <div className="farmer-container">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full box-border overflow-x-hidden">
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-900 font-medium border border-emerald-200">
            {message}
          </div>
        )}

        <div className="welcome-section mb-8">
          <h2 className="text-4xl font-bold text-emerald-950">
            Welcome back, {user?.fullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-emerald-700 mt-1">
            Manage your yam production and tax
          </p>
        </div>

        {/* Stats Cards - Restored original grid classes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="stat-card stat-production">
            <div className="stat-icon">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value">{totalProduction.toFixed(1)}</div>
            <div className="stat-label">Total Yam Production</div>
          </div>

          <div className="stat-card stat-taxdue">
            <div className="stat-icon">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value">₦{totalTaxDue.toLocaleString()}</div>
            <div className="stat-label">Total Tax Due</div>
          </div>

          <div className="stat-card stat-outstanding">
            <div className="stat-icon">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value">₦{outstanding.toLocaleString()}</div>
            <div className="stat-label">Outstanding Tax</div>
          </div>
        </div>

        {/* Record Production Form */}
        <div className="glass-card p-8 rounded-3xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-semibold text-emerald-950">
              Record New Production
            </h3>
          </div>

          <form
            onSubmit={handleProductionSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <select
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                className="input-field w-full bg-white"
              >
                <option value="Main">Main Season</option>
                <option value="Dry">Dry Season</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production (Tonnes)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.productionTonnes}
                onChange={(e) =>
                  setFormData({ ...formData, productionTonnes: e.target.value })
                }
                placeholder="Tonnes"
                required
                className="input-field w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary md:col-span-3 py-4 text-lg font-semibold w-full"
            >
              {loading ? "Recording..." : "Record Production & Calculate Tax"}
            </button>
          </form>
        </div>

        {/* Production & Tax History (Scrollable Table Container) */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-8 border-b flex items-center gap-3 bg-emerald-50">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-semibold text-emerald-950">
              Production & Tax History
            </h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="custom-table w-full min-w-[700px]">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Season</th>
                  <th>Production (Tonnes)</th>
                  <th>Tax Due (₦)</th>
                  <th>Paid (₦)</th>
                  <th>Outstanding (₦)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {productions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      No records yet
                    </td>
                  </tr>
                ) : (
                  productions.map((p) => {
                    const paid = p.payments.reduce(
                      (sum, pay) => sum + Number(pay.amount || 0),
                      0,
                    );
                    return (
                      <tr key={p.id}>
                        <td className="font-medium">{p.year}</td>
                        <td>{p.season}</td>
                        <td className="font-semibold">{p.productionTonnes}</td>
                        <td>₦{Number(p.taxDue).toLocaleString()}</td>
                        <td className="text-green-600 font-medium">
                          ₦{paid.toLocaleString()}
                        </td>
                        <td className="text-rose-600 font-medium">
                          ₦{(p.taxDue - paid).toLocaleString()}
                        </td>
                        <td>
                          <button
                            onClick={() => openPaymentModal(p)}
                            className="pay-button flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl transition-all whitespace-nowrap text-sm"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay ₦{Number(p.taxDue).toLocaleString()}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-emerald-950">
              <CreditCard className="text-emerald-600" /> Confirm Tax Payment
            </h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Fixed Tax Amount Due (₦)
                </label>
                <input
                  type="text"
                  value={`₦${Number(paymentData.amount).toLocaleString()}`}
                  disabled
                  className="input-field text-xl font-bold bg-gray-100 text-emerald-900 cursor-not-allowed w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tax pricing is fixed per season. A secure reference code will
                  be generated automatically.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                >
                  {loading
                    ? "Processing..."
                    : `Pay ₦${Number(paymentData.amount).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
