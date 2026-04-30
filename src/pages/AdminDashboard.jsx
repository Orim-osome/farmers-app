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
  const [taxRate, setTaxRate] = useState(7500);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [reportRes, farmersRes] = await Promise.all([
        API.get("/admin/reports"),
        API.get("/admin/farmers"),
      ]);
      setStats(reportRes.data);
      setFarmers(farmersRes.data);

      // Fetch payments
      const paymentsRes = await API.get("/admin/payments"); // We'll add this endpoint
      setPayments(paymentsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaxRate = async () => {
    setLoading(true);
    try {
      await API.put("/admin/tax-rate", { rate: taxRate });
      alert("✅ Tax rate updated successfully!");
      fetchAllData();
    } catch (err) {
      alert("Failed to update tax rate");
    } finally {
      setLoading(false);
    }
  };

  const outstandingTax = (stats.totalTaxDue || 0) - (stats.totalCollected || 0);

  return (
    <div className="admin-container">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold text-emerald-950 mb-2">
          Admin Reports
        </h2>
        <p className="text-emerald-700 mb-10">
          Comprehensive overview and analytics
        </p>

        {/* Stats Cards */}
        <div className="admin-stats mb-12">
          <div className="stat-card stat-farmers">
            <div className="stat-icon">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value">{stats.totalFarmers || 0}</div>
            <div className="stat-label">Total Farmers</div>
          </div>

          <div className="stat-card stat-production">
            <div className="stat-icon">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value">
              {stats.totalProduction?.toFixed(1) || 0}
            </div>
            <div className="stat-label">Total Production</div>
          </div>

          <div className="stat-card stat-collected">
            <div className="stat-icon">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value">
              ₦{(stats.totalCollected || 0).toLocaleString()}
            </div>
            <div className="stat-label">Tax Collected</div>
          </div>

          <div className="stat-card stat-outstanding">
            <div className="stat-icon">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value">₦{outstandingTax.toLocaleString()}</div>
            <div className="stat-label">Outstanding Tax</div>
          </div>
        </div>

        {/* Tax Rate Management */}
        <div className="tax-control glass-card mb-12">
          <div className="flex items-center gap-4 mb-8">
            <Settings className="w-8 h-8 text-emerald-600" />
            <h3 className="text-2xl font-semibold text-emerald-950">
              Tax Rate Management
            </h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tax per Tonne (₦)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="input-field text-2xl font-semibold"
              />
            </div>
            <button
              onClick={updateTaxRate}
              disabled={loading}
              className="btn-primary px-12 py-4"
            >
              {loading ? "Updating..." : "Update Tax Rate"}
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bar Chart - Production by LGA */}
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <BarChart3 className="text-emerald-600" /> Production by LGA
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byLga || []}>
                <XAxis dataKey="lga" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="_count.id" fill="#166534" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Tax Overview */}
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <DollarSign className="text-emerald-600" /> Tax Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Collected", value: stats.totalCollected || 0 },
                    { name: "Outstanding", value: outstandingTax },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
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

        {/* Payments Report Table */}
        <div className="glass-card rounded-3xl overflow-hidden mb-12">
          <div className="p-8 border-b bg-emerald-50 flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-semibold text-emerald-950">
              Recent Tax Payments
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="custom-table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farmer</th>
                  <th>Production Year</th>
                  <th>Amount Paid (₦)</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No payments recorded yet
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={index}>
                      <td>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td>{payment.production?.user?.fullName}</td>
                      <td>{payment.production?.year}</td>
                      <td className="text-green-600 font-medium">
                        ₦{Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="font-mono text-sm">
                        {payment.reference || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Farmers List */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-8 border-b bg-emerald-50">
            <h3 className="text-2xl font-semibold text-emerald-950">
              All Registered Farmers ({farmers.length})
            </h3>
          </div>
          <div className="farmers-table-container">
            <table className="custom-table w-full">
              <thead>
                <tr>
                  <th>FARMER ID</th>
                  <th>FULL NAME</th>
                  <th>LGA</th>
                  <th>VILLAGE</th>
                  <th>PHONE</th>
                  <th>FARM SIZE</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr key={farmer.id}>
                    <td className="font-mono font-medium">{farmer.farmerId}</td>
                    <td>{farmer.fullName}</td>
                    <td>{farmer.lga}</td>
                    <td>{farmer.village}</td>
                    <td>{farmer.phone}</td>
                    <td>
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
