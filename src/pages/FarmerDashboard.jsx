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
    reference: "",
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

  const openPaymentModal = (productionId) => {
    setPaymentData({ productionId, amount: "", reference: "" });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) return;

    setLoading(true);
    try {
      await API.post("/payment", {
        productionId: paymentData.productionId,
        amount: parseFloat(paymentData.amount),
        reference: paymentData.reference || null,
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

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="welcome-section mb-10">
          <h2 className="text-4xl font-bold text-emerald-950">
            Welcome back, {user?.fullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-emerald-700 mt-2">
            Manage your yam production and tax
          </p>
        </div>

        {/* Stats */}
        <div className="farmer-stats mb-12">
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

        {/* Record Production */}
        <div className="glass-card p-10 rounded-3xl mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Plus className="w-7 h-7 text-emerald-600" />
            <h3 className="text-2xl font-semibold text-emerald-950">
              Record New Production
            </h3>
          </div>

          <form
            onSubmit={handleProductionSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <input
              type="number"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: parseInt(e.target.value) })
              }
              className="input-field"
            />
            <select
              value={formData.season}
              onChange={(e) =>
                setFormData({ ...formData, season: e.target.value })
              }
              className="input-field"
            >
              <option value="Main">Main Season</option>
              <option value="Dry">Dry Season</option>
            </select>
            <input
              type="number"
              step="0.1"
              value={formData.productionTonnes}
              onChange={(e) =>
                setFormData({ ...formData, productionTonnes: e.target.value })
              }
              placeholder="Tonnes"
              required
              className="input-field"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary md:col-span-3 py-4 text-lg font-semibold"
            >
              {loading ? "Recording..." : "Record Production & Calculate Tax"}
            </button>
          </form>
        </div>

        {/* Production History */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-8 border-b flex items-center gap-3 bg-emerald-50">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-semibold text-emerald-950">
              Production & Tax History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="custom-table w-full">
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
                            onClick={() => openPaymentModal(p.id)}
                            className="pay-button"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay
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

      {/* Beautiful Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <CreditCard className="text-emerald-600" /> Record Tax Payment
            </h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Amount Paid (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  className="input-field text-lg"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      reference: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Receipt number or bank ref"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all"
                >
                  {loading ? "Processing..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
