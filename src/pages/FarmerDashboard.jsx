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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 w-full box-border">
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-medium border border-emerald-200">
            {message}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-emerald-950">
            Welcome back, {user?.fullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-emerald-700 mt-1 text-xs sm:text-base">
            Manage your yam production and tax
          </p>
        </div>

        {/* Stats Cards - Compact Row Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-emerald-700 text-white p-4 rounded-2xl shadow-sm">
            <Leaf className="w-5 h-5 opacity-80 mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              {totalProduction.toFixed(1)}
            </div>
            <div className="text-xs opacity-90">Total Yam Production</div>
          </div>

          <div className="bg-amber-600 text-white p-4 rounded-2xl shadow-sm">
            <Wallet className="w-5 h-5 opacity-80 mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              ₦{totalTaxDue.toLocaleString()}
            </div>
            <div className="text-xs opacity-90">Total Tax Due</div>
          </div>

          <div className="bg-rose-700 text-white p-4 rounded-2xl shadow-sm">
            <TrendingUp className="w-5 h-5 opacity-80 mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              ₦{outstanding.toLocaleString()}
            </div>
            <div className="text-xs opacity-90">Outstanding Tax</div>
          </div>
        </div>

        {/* Record Production Form */}
        <div className="bg-white border border-emerald-100 p-4 sm:p-6 rounded-2xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg sm:text-xl font-semibold text-emerald-950">
              Record New Production
            </h3>
          </div>

          <form
            onSubmit={handleProductionSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
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
                className="w-full p-3 border rounded-xl text-sm bg-gray-50"
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
                className="w-full p-3 border rounded-xl text-sm bg-white"
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
                className="w-full p-3 border rounded-xl text-sm bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm text-sm mt-1"
            >
              {loading ? "Recording..." : "Record Production & Calculate Tax"}
            </button>
          </form>
        </div>

        {/* Production History Table */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-emerald-50/50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base sm:text-lg font-semibold text-emerald-950">
              Production & Tax History
            </h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b text-xs">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Season</th>
                  <th className="p-3">Tonnes</th>
                  <th className="p-3">Tax Due</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Outstanding</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {productions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-8 text-gray-400 text-xs"
                    >
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
                      <tr
                        key={p.id}
                        className="border-b hover:bg-gray-50/50 text-xs sm:text-sm"
                      >
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
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-medium shadow-sm"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2 text-emerald-950">
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
                  className="w-full p-3 border rounded-xl text-base font-bold bg-gray-100 text-emerald-900 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tax pricing is fixed per season. A secure reference code will
                  be generated automatically.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm text-xs sm:text-sm"
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
