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

  return (
    <div className="admin-container min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full box-border">
        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 mb-2">
          Admin Reports
        </h2>
        <p className="text-emerald-700 mb-8 text-sm sm:text-base">
          Comprehensive overview and analytics
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 w-full">
          <div className="stat-card stat-farmers p-6 rounded-3xl w-full box-border">
            <div className="stat-icon mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value text-2xl sm:text-3xl">
              {stats.totalFarmers || 0}
            </div>
            <div className="stat-label">Total Farmers</div>
          </div>

          <div className="stat-card stat-production p-6 rounded-3xl w-full box-border">
            <div className="stat-icon mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value text-2xl sm:text-3xl">
              {stats.totalProduction?.toFixed(1) || 0}
            </div>
            <div className="stat-label">Total Production</div>
          </div>

          <div className="stat-card stat-collected p-6 rounded-3xl w-full box-border">
            <div className="stat-icon mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value text-xl sm:text-2xl">
              ₦{(stats.totalCollected || 0).toLocaleString()}
            </div>
            <div className="stat-label">Tax Collected</div>
          </div>

          <div className="stat-card stat-outstanding p-6 rounded-3xl w-full box-border">
            <div className="stat-icon mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="stat-value text-xl sm:text-2xl">
              ₦{outstandingTax.toLocaleString()}
            </div>
            <div className="stat-label">Outstanding Tax</div>
          </div>
        </div>

        {/* Tax Rate Management */}
        <div className="tax-control glass-card p-6 sm:p-8 rounded-3xl mb-10 w-full box-border">
          <div className="flex items-center gap-4 mb-6">
            <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-950">
              Tax Rate Management
            </h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-end w-full">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Tax Amount per Farmer Season (₦)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="input-field text-xl sm:text-2xl font-semibold w-full box-border"
              />
            </div>
            <button
              onClick={updateTaxRate}
              disabled={loading}
              className="btn-primary px-8 sm:px-12 py-4 w-full md:w-auto"
            >
              {loading ? "Updating..." : "Update Tax Rate"}
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10 w-full">
          <div className="glass-card p-6 sm:p-8 rounded-3xl w-full box-border">
            <h3 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-3">
              <BarChart3 className="text-emerald-600" /> Farmers Distribution by
              LGA
            </h3>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byLga || []}>
                  <XAxis dataKey="lga" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="_count.id" fill="#166534" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl w-full box-border">
            <h3 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-3">
              <DollarSign className="text-emerald-600" /> Tax Overview
            </h3>
            <div className="w-full h-[250px] sm:h-[300px]">
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
                    outerRadius={100}
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

        {/* Payments Report Table (Scrollable Table Only) */}
        <div className="glass-card rounded-3xl overflow-hidden mb-10 w-full box-border">
          <div className="p-6 sm:p-8 border-b bg-emerald-50 flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-950">
              Recent Tax Payments
            </h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="custom-table w-full min-w-[600px]">
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

        {/* Farmers List Table (Scrollable Table Only) */}
        <div className="glass-card rounded-3xl overflow-hidden w-full box-border">
          <div className="p-6 sm:p-8 border-b bg-emerald-50">
            <h3 className="text-xl sm:text-2xl font-semibold text-emerald-950">
              All Registered Farmers ({farmers.length})
            </h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="custom-table w-full min-w-[600px]">
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
