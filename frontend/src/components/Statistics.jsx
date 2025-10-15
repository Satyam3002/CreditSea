import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

const Statistics = () => {
  const [summaryStats, setSummaryStats] = useState(null);
  const [creditScoreDistribution, setCreditScoreDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Load summary statistics
      const summaryResponse = await apiService.getSummaryStats();
      setSummaryStats(summaryResponse.data);
      
      // Load credit score distribution
      const distributionResponse = await apiService.getCreditScoreDistribution();
      setCreditScoreDistribution(distributionResponse.data);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Failed to load statistics');
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

  const getScoreRangeLabel = (range) => {
    const ranges = {
      '300-400': 'Poor (300-400)',
      '400-500': 'Fair (400-500)',
      '500-600': 'Fair+ (500-600)',
      '600-700': 'Good (600-700)',
      '700-800': 'Very Good (700-800)',
      '800-900': 'Excellent (800-900)',
      'Other': 'Other'
    };
    return ranges[range] || range;
  };

  const getScoreRangeColor = (range) => {
    const colors = {
      '300-400': 'bg-red-500',
      '400-500': 'bg-orange-500',
      '500-600': 'bg-yellow-500',
      '600-700': 'bg-blue-500',
      '700-800': 'bg-green-500',
      '800-900': 'bg-emerald-500',
      'Other': 'bg-gray-500'
    };
    return colors[range] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into credit report data</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summaryStats?.totalReports || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Credit Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(summaryStats?.avgCreditScore || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summaryStats?.totalAccounts || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summaryStats?.totalCurrentBalance || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Score Range */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Credit Score Range</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Highest Score</span>
              <span className="font-semibold text-green-600">{summaryStats?.maxCreditScore || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lowest Score</span>
              <span className="font-semibold text-red-600">{summaryStats?.minCreditScore || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Score Range</span>
              <span className="font-semibold text-blue-600">
                {summaryStats?.minCreditScore || 0} - {summaryStats?.maxCreditScore || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Account Statistics</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Accounts</span>
              <span className="font-semibold text-green-600">{formatNumber(summaryStats?.totalActiveAccounts || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Accounts</span>
              <span className="font-semibold text-blue-600">{formatNumber(summaryStats?.totalAccounts || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Rate</span>
              <span className="font-semibold text-purple-600">
                {summaryStats?.totalAccounts > 0 
                  ? Math.round((summaryStats.totalActiveAccounts / summaryStats.totalAccounts) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Score Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Credit Score Distribution</h2>
        </div>

        {creditScoreDistribution.length > 0 ? (
          <div className="space-y-4">
            {creditScoreDistribution.map((bucket, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${getScoreRangeColor(bucket._id)}`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {getScoreRangeLabel(bucket._id)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreRangeColor(bucket._id)}`}
                      style={{
                        width: `${(bucket.count / Math.max(...creditScoreDistribution.map(b => b.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {bucket.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No credit score data available</p>
          </div>
        )}
      </div>

      {/* Financial Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(summaryStats?.totalCurrentBalance || 0)}
            </div>
            <div className="text-sm text-blue-600 font-medium">Total Current Balance</div>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(summaryStats?.avgCreditScore || 0)}
            </div>
            <div className="text-sm text-green-600 font-medium">Average Balance per Report</div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {summaryStats?.recentReports || 0}
            </div>
            <div className="text-sm text-purple-600 font-medium">Recent Reports (7 days)</div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Performance Indicators</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {summaryStats?.totalReports > 0 ? Math.round((summaryStats.totalActiveAccounts / summaryStats.totalAccounts) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Account Activity Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {summaryStats?.totalReports > 0 ? Math.round(summaryStats.totalCurrentBalance / summaryStats.totalReports) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Balance per Report</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {summaryStats?.totalAccounts > 0 ? Math.round(summaryStats.totalAccounts / summaryStats.totalReports) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Accounts per Report</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {summaryStats?.avgCreditScore || 0}
            </div>
            <div className="text-sm text-gray-600">System Avg Credit Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
