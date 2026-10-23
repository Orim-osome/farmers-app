import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../config/api";
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Settings,
  BarChart3,
  CreditCard,
} from "lucide-react";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "../styles/AdminDashboard.css";

const COLORS = ["#166534", "#4ade80", "#eab308", "#ef4444", "#3b82f6"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [taxRate, setTaxRate] = useState(5000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [reportRes, farmersRes, paymentsRes, taxRateRes] =
        await Promise.all([
          API.get("/admin/reports"),
          API.get("/admin/farmers"),
          API.get("/admin/payments"),
          API.get("/admin/tax-rate"),
        ]);

      setStats(reportRes.data);
      setFarmers(farmersRes.data);
      setPayments(paymentsRes.data || []);

      if (taxRateRes.data && taxRateRes.data.fixedTaxAmount !== undefined) {
        setTaxRate(taxRateRes.data.fixedTaxAmount);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  const updateTaxRate = async () => {
    setLoading(true);
    try {
      await API.put("/admin/tax-rate", { fixedTaxAmount: taxRate });
      alert("✅ Fixed tax amount updated successfully!");
      fetchAllData();
    } catch (err) {
      alert("Failed to update tax amount");
    } finally {
      setLoading(false);
    }
  };

  const outstandingTax = (stats.totalTaxDue || 0) - (stats.totalCollected || 0);

  const totalFarmersCount = stats.totalFarmers || 1;
  const lgaChartData = (stats.byLga || []).map((item) => ({
    lga: item.lga || "Unknown",
    percentage: Math.round(((item._count?.id || 0) / totalFarmersCount) * 100),
    count: item._count?.id || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 w-full box-border">
        <h2 className="text-2xl sm:text-4xl font-bold text-emerald-950 mb-1">
          Admin Reports
        </h2>
        <p className="text-emerald-700 mb-6 text-xs sm:text-base">
          Comprehensive overview and analytics
        </p>

        {/* Stats Cards - Forced 2-column on mobile, 4-column on desktop to prevent giant stacking */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-emerald-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
            <Users className="w-6 h-6 opacity-80 mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              {stats.totalFarmers || 0}
            </div>
            <div className="text-xs opacity-90">Total Farmers</div>
          </div>

          <div className="bg-amber-600 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
            <TrendingUp className="w-6 h-6 opacity-80 mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              {stats.totalProduction?.toFixed(1) || 0}
            </div>
            <div className="text-xs opacity-90">Total Production</div>
          </div>

          <div className="bg-blue-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
            <DollarSign className="w-6 h-6 opacity-80 mb-2" />
            <div className="text-base sm:text-xl font-bold truncate">
              ₦{(stats.totalCollected || 0).toLocaleString()}
            </div>
            <div className="text-xs opacity-90">Tax Collected</div>
          </div>

          <div className="bg-rose-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
            <AlertTriangle className="w-6 h-6 opacity-80 mb-2" />
            <div className="text-base sm:text-xl font-bold truncate">
              ₦{outstandingTax.toLocaleString()}
            </div>
            <div className="text-xs opacity-90">Outstanding Tax</div>
          </div>
        </div>

        {/* Tax Rate Management */}
        <div className="bg-white border border-emerald-100 p-4 sm:p-6 rounded-2xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg sm:text-xl font-semibold text-emerald-950">
              Tax Rate Management
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fixed Tax Amount per Farmer Season (₦)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border rounded-xl text-base sm:text-lg font-semibold bg-gray-50"
              />
            </div>
            <button
              onClick={updateTaxRate}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all text-sm"
            >
              {loading ? "Updating..." : "Update Tax Rate"}
            </button>
          </div>
        </div>

        {/* Charts Section with Explicit Heights for Visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-emerald-100 p-4 sm:p-6 rounded-2xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-950">
              <BarChart3 className="text-emerald-600 w-5 h-5" /> Production
              Distribution (%)
            </h3>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lgaChartData}>
                  <XAxis dataKey="lga" tick={{ fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.count} farmers)`,
                      "Share",
                    ]}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#166534"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 p-4 sm:p-6 rounded-2xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-950">
              <DollarSign className="text-emerald-600 w-5 h-5" /> Tax Overview
            </h3>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Collected", value: stats.totalCollected || 0 },
                      { name: "Outstanding", value: outstandingTax },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Tax Payments Table */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b bg-emerald-50/50 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base sm:text-lg font-semibold text-emerald-950">
              Recent Tax Payments
            </h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b text-xs">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-8 text-gray-400 text-xs"
                    >
                      No payments recorded yet
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50/50 text-xs sm:text-sm"
                    >
                      <td className="p-3">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {payment.production?.user?.fullName}
                      </td>
                      <td className="p-3">{payment.production?.year}</td>
                      <td className="p-3 text-green-600 font-medium">
                        ₦{Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-500">
                        {payment.reference || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Farmers List Table */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-emerald-50/50">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-950">
              All Registered Farmers ({farmers.length})
            </h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b text-xs">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">NAME</th>
                  <th className="p-3">LGA</th>
                  <th className="p-3">VILLAGE</th>
                  <th className="p-3">PHONE</th>
                  <th className="p-3">SIZE</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    className="border-b hover:bg-gray-50/50 text-xs sm:text-sm"
                  >
                    <td className="p-3 font-mono font-medium">
                      {farmer.farmerId}
                    </td>
                    <td className="p-3">{farmer.fullName}</td>
                    <td className="p-3">{farmer.lga}</td>
                    <td className="p-3">{farmer.village}</td>
                    <td className="p-3">{farmer.phone}</td>
                    <td className="p-3">
                      {farmer.farmSizeHa ? farmer.farmSizeHa + " ha" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
