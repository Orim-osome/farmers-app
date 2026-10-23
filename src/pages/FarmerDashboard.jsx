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
    <div className="farmer-container min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-900 font-medium border border-emerald-200">
            {message}
          </div>
        )}

        <div className="welcome-section mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950">
            Welcome back, {user?.fullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-emerald-700 mt-1 text-sm sm:text-base">
            Manage your yam production and tax
          </p>
        </div>

        {/* Stats Cards - Compact Row Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card stat-production p-5 rounded-2xl bg-emerald-700 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-2xl font-bold">
              {totalProduction.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              Total Yam Production
            </div>
          </div>

          <div className="stat-card stat-taxdue p-5 rounded-2xl bg-amber-600 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-xl font-bold">
              ₦{totalTaxDue.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm opacity-90">Total Tax Due</div>
          </div>

          <div className="stat-card stat-outstanding p-5 rounded-2xl bg-rose-700 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-xl font-bold">
              ₦{outstanding.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm opacity-90">Outstanding Tax</div>
          </div>
        </div>

        {/* Record Production Form */}
        <div className="bg-white border border-emerald-100 p-6 sm:p-8 rounded-2xl shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-semibold text-emerald-950">
              Record New Production
            </h3>
          </div>

          <form
            onSubmit={handleProductionSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="input-field w-full p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Season
              </label>
              <select
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                className="input-field w-full p-3 border rounded-xl bg-white"
              >
                <option value="Main">Main Season</option>
                <option value="Dry">Dry Season</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Production (Tonnes)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.productionTonnes}
                onChange={(e) =>
                  setFormData({ ...formData, productionTonnes: e.target.value })
                }
                placeholder="e.g. 5.5"
                required
                className="input-field w-full p-3 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary md:col-span-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md mt-2"
            >
              {loading ? "Recording..." : "Record Production & Calculate Tax"}
            </button>
          </form>
        </div>

        {/* Production History (Scrollable Table Only) */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-emerald-50/50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-950">
              Production & Tax History
            </h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="custom-table w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Season</th>
                  <th className="p-3">Production (Tonnes)</th>
                  <th className="p-3">Tax Due (₦)</th>
                  <th className="p-3">Paid (₦)</th>
                  <th className="p-3">Outstanding (₦)</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {productions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400">
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
                      <tr key={p.id} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 font-medium">{p.year}</td>
                        <td className="p-3">{p.season}</td>
                        <td className="p-3 font-semibold">
                          {p.productionTonnes}
                        </td>
                        <td className="p-3">
                          ₦{Number(p.taxDue).toLocaleString()}
                        </td>
                        <td className="p-3 text-green-600 font-medium">
                          ₦{paid.toLocaleString()}
                        </td>
                        <td className="p-3 text-rose-600 font-medium">
                          ₦{(p.taxDue - paid).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => openPaymentModal(p)}
                            className="pay-button flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-medium shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-950">
              <CreditCard className="text-emerald-600 w-5 h-5" /> Confirm Tax
              Payment
            </h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fixed Tax Amount Due (₦)
                </label>
                <input
                  type="text"
                  value={`₦${Number(paymentData.amount).toLocaleString()}`}
                  disabled
                  className="input-field text-lg font-bold bg-gray-100 text-emerald-900 cursor-not-allowed w-full p-3 border rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tax pricing is fixed per season. A secure reference code will
                  be generated automatically.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md text-sm"
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
