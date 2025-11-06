import React, { useState, useEffect } from 'react';
import { getAnalytics, exportAnalytics } from '../api/vendor';
import { useAuth } from '../context/AuthContext';
import RevenueChart from '../components/analytics/RevenueChart';
import TopItemsList from '../components/analytics/TopItemsList';

export default function Analytics() {
  const { token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      let startDate, endDate;
      if (dateRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        const days = parseInt(dateRange.replace('days', ''));
        endDate = new Date().toISOString().split('T')[0];
        startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const data = await getAnalytics({ startDate, endDate });

      // Wrap API response into summary for UI consistency
      setAnalyticsData({
        summary: {
          totalRevenue: data.totalRevenue ?? 0,
          totalOrders: data.totalOrders ?? 0,
          avgOrderValue: data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : 0,
          avgPrepTime: data.averagePrepTime ?? 0,
          revenueChange: 0,
          ordersChange: 0,
          avgOrderValueChange: 0,
          avgPrepTimeChange: 0
        },
        revenueData: data.revenueData || [],
        topItems: data.topItems || []
      });

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
      setAnalyticsData(getFallbackAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);

      let startDate, endDate;
      if (dateRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        const days = parseInt(dateRange.replace('days', ''));
        endDate = new Date().toISOString().split('T')[0];
        startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const blob = await exportAnalytics({ token, startDate, endDate });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export analytics:', err);
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (dateRange !== 'custom' || (customStartDate && customEndDate)) {
      fetchAnalytics();
    }
  }, [dateRange, customStartDate, customEndDate]);

  const getFallbackAnalytics = () => ({
    summary: {
      totalRevenue: 12355,
      totalOrders: 86,
      avgOrderValue: 144,
      avgPrepTime: 18,
      revenueChange: 12.5,
      ordersChange: 8.3,
      avgOrderValueChange: 3.2,
      avgPrepTimeChange: -2
    },
    revenueData: [
      { date: '1 Jan', revenue: 1280, day: '1 Jan' },
      { date: '2 Jan', revenue: 1450, day: '2 Jan' },
      { date: '3 Jan', revenue: 1150, day: '3 Jan' },
      { date: '4 Jan', revenue: 2100, day: '4 Jan' },
      { date: '5 Jan', revenue: 1850, day: '5 Jan' },
      { date: '6 Jan', revenue: 2200, day: '6 Jan' },
      { date: '7 Jan', revenue: 2375, day: '7 Jan' }
    ],
    topItems: [
      { name: 'Butter Chicken', orders: 45, revenue: 14400, rank: 1 },
      { name: 'Paneer Tikka Masala', orders: 32, revenue: 8960, rank: 2 },
      { name: 'Veg Biryani', orders: 28, revenue: 7000, rank: 3 },
      { name: 'Garlic Naan', orders: 56, revenue: 3360, rank: 4 },
      { name: 'Dal Tadka', orders: 21, revenue: 4200, rank: 5 }
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-4 border-[#ff6600] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Analytics & Reports</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Track your business performance and insights</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-lg focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
              />
            </div>
          )}

          {/* Export Button */}
          {/* <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button> */}
        </div>
      </div>

      {error && (
        <div className="bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 rounded-lg p-4">
          <p className="text-[hsl(var(--destructive))]">{error}</p>
        </div>
      )}

      {analyticsData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
              <p className="text-[hsl(var(--muted-foreground))] text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">₹{analyticsData?.summary?.totalRevenue?.toLocaleString() ?? 0}</p>
              <p className="text-sm text-green-600 mt-1">
                +{analyticsData?.summary?.revenueChange ?? 0}% from last period
              </p>
            </div>

            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
              <p className="text-[hsl(var(--muted-foreground))] text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{analyticsData?.summary?.totalOrders ?? 0}</p>
              <p className="text-sm text-green-600 mt-1">
                +{analyticsData?.summary?.ordersChange ?? 0}% from last period
              </p>
            </div>

            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
              <p className="text-[hsl(var(--muted-foreground))] text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">₹{analyticsData?.summary?.avgOrderValue ?? 0}</p>
              <p className="text-sm text-green-600 mt-1">
                +{analyticsData?.summary?.avgOrderValueChange ?? 0}% from last period
              </p>
            </div>

            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
              <p className="text-[hsl(var(--muted-foreground))] text-sm">Avg Prep Time</p>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{analyticsData?.summary?.avgPrepTime ?? 0} mins</p>
              <p className="text-sm text-green-600 mt-1">
                {analyticsData?.summary?.avgPrepTimeChange ?? 0} mins from last period
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <svg className="h-5 w-5 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Revenue Trend</h3>
            </div>
            <RevenueChart data={analyticsData?.revenueData || []} />
          </div>

          {/* Top Selling Items */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <svg className="h-5 w-5 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Top Selling Items</h3>
            </div>
            <TopItemsList items={analyticsData?.topItems || []} />
          </div>
        </>
      )}
    </div>
  );
}
