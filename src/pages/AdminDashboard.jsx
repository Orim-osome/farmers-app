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

  // Format LGA data for percentage scaling up to 100% if needed
  const totalFarmersCount = stats.totalFarmers || 1;
  const lgaChartData = (stats.byLga || []).map((item) => ({
    lga: item.lga || "Unknown",
    // Calculate percentage representation for the Y-axis scale (10% to 100%)
    percentage: Math.round(((item._count?.id || 0) / totalFarmersCount) * 100),
    count: item._count?.id || 0,
  }));

  return (
    <div className="admin-container min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 mb-1">
          Admin Reports
        </h2>
        <p className="text-emerald-700 mb-8 text-sm sm:text-base">
          Comprehensive overview and analytics
        </p>

        {/* Stats Cards - Compact Row Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card stat-farmers p-4 sm:p-6 rounded-2xl bg-emerald-700 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
            </div>
            <div className="text-xl sm:text-3xl font-bold">
              {stats.totalFarmers || 0}
            </div>
            <div className="text-xs sm:text-sm opacity-90">Total Farmers</div>
          </div>

          <div className="stat-card stat-production p-4 sm:p-6 rounded-2xl bg-amber-600 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
            </div>
            <div className="text-xl sm:text-3xl font-bold">
              {stats.totalProduction?.toFixed(1) || 0}
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              Total Production
            </div>
          </div>

          <div className="stat-card stat-collected p-4 sm:p-6 rounded-2xl bg-blue-700 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              ₦{(stats.totalCollected || 0).toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm opacity-90">Tax Collected</div>
          </div>

          <div className="stat-card stat-outstanding p-4 sm:p-6 rounded-2xl bg-rose-700 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              ₦{outstandingTax.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm opacity-90">Outstanding Tax</div>
          </div>
        </div>

        {/* Tax Rate Management */}
        <div className="tax-control bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-semibold text-emerald-950">
              Tax Rate Management
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Fixed Tax Amount per Farmer Season (₦)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="input-field text-lg sm:text-xl font-semibold w-full p-3 border rounded-xl"
              />
            </div>
            <button
              onClick={updateTaxRate}
              disabled={loading}
              className="btn-primary px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all w-full sm:w-auto"
            >
              {loading ? "Updating..." : "Update Tax Rate"}
            </button>
          </div>
        </div>

        {/* Charts Section with 10% - 100% Y-Axis Scaling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-950">
              <BarChart3 className="text-emerald-600 w-5 h-5" /> Production /
              Distribution by LGA (%)
            </h3>
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lgaChartData}>
                  <XAxis dataKey="lga" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 12 }}
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
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-950">
              <DollarSign className="text-emerald-600 w-5 h-5" /> Tax Overview
            </h3>
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Collected", value: stats.totalCollected || 0 },
                      { name: "Outstanding", value: outstandingTax },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
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
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b bg-emerald-50/50 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-950">
              Recent Tax Payments
            </h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="custom-table w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Production Year</th>
                  <th className="p-3">Amount Paid (₦)</th>
                  <th className="p-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                      No payments recorded yet
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50/50">
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
                      <td className="p-3 font-mono text-xs">
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
          <div className="p-5 border-b bg-emerald-50/50">
            <h3 className="text-lg font-semibold text-emerald-950">
              All Registered Farmers ({farmers.length})
            </h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="custom-table w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="p-3">FARMER ID</th>
                  <th className="p-3">FULL NAME</th>
                  <th className="p-3">LGA</th>
                  <th className="p-3">VILLAGE</th>
                  <th className="p-3">PHONE</th>
                  <th className="p-3">FARM SIZE</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr key={farmer.id} className="border-b hover:bg-gray-50/50">
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
