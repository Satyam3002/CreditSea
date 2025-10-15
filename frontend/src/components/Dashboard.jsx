import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Users,
  CreditCard,
  DollarSign,
  Activity,
  BarChart3,
  Zap,
  ArrowUpRight,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsResponse = await apiService.getSummaryStats();
      setStats(statsResponse.data);
      
      const reportsResponse = await apiService.getReports({ 
        limit: 5, 
        sortBy: 'processedAt', 
        sortOrder: 'desc' 
      });
      setRecentReports(reportsResponse.data);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getCreditScoreColor = (score) => {
    if (score >= 750) return 'from-emerald-500 to-green-600';
    if (score >= 650) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getCreditScoreLabel = (score) => {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Welcome to CreditSea</h1>
                <p className="text-blue-100 text-lg">Your comprehensive credit intelligence platform</p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+12%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(stats?.totalReports || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Credit reports processed</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              <span className="font-medium">+5%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Credit Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(stats?.avgCreditScore || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">System average</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Active</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Accounts</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(stats?.totalAccounts || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Credit accounts tracked</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Live</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats?.totalCurrentBalance || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Outstanding amounts</p>
          </div>
        </div>
      </div>

      {/* Analytics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Credit Score Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Credit Analytics</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Highest Score</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats?.maxCreditScore || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Lowest Score</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats?.minCreditScore || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Active Accounts</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{formatNumber(stats?.totalActiveAccounts || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Recent Reports</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats?.recentReports || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <Link 
              to="/reports" 
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report._id} className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{report.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-gray-600 font-mono">{report.formattedPAN}</p>
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(report.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getCreditScoreColor(report.creditScore)} text-white shadow-lg`}>
                        {report.creditScore}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{getCreditScoreLabel(report.creditScore)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No reports yet</p>
              <p className="text-sm text-gray-500">Upload your first XML file to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
          <div className="flex items-center space-x-2 text-blue-600">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Get Started</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/upload"
            className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 hover:from-blue-100 hover:to-indigo-200 transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Upload XML</h4>
                <p className="text-sm text-gray-600">Process credit reports</p>
              </div>
            </div>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Start Upload</span>
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
            </div>
          </Link>
          
          <Link
            to="/reports"
            className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 hover:from-green-100 hover:to-emerald-200 transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">View Reports</h4>
                <p className="text-sm text-gray-600">Browse all reports</p>
              </div>
            </div>
            <div className="flex items-center text-green-600 font-medium">
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
            </div>
          </Link>
          
          <Link
            to="/statistics"
            className="group p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200 hover:from-purple-100 hover:to-violet-200 transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600">View insights</p>
              </div>
            </div>
            <div className="flex items-center text-purple-600 font-medium">
              <span>Explore</span>
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
