import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, Star, Clock, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/utils/csvExport';
import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basicData, setBasicData] = useState(null);
  const [comprehensiveData, setComprehensiveData] = useState(null);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  useEffect(() => {
    fetchAnalytics();
  }, []);


   async function fetchOrdersCSV() {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const token = await getFirebaseToken(); 

          const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders/export`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/csv', // optional
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch CSV');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'orders_by_status.csv';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error exporting CSV:', error.message);
        }
      }

      // Helper function to get Firebase ID token
      async function getFirebaseToken() {
        const auth = getAuth(); 
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        return await user.getIdToken();
      }

const fetchAnalytics = async () => {
  try {
    setLoading(true);
    setError(null);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }



    const token = await user.getIdToken(); // get Firebase ID token

    const [basicRes, comprehensiveRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/v1/admin/analytics/basic`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
      fetch(`${API_BASE_URL}/api/v1/admin/analytics/comprehensive`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
    ]);
   

    if (!basicRes.ok || !comprehensiveRes.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const basicJson = await basicRes.json();
    const comprehensiveJson = await comprehensiveRes.json();

    if (basicJson.success) {
      setBasicData(basicJson.data);
    }
    if (comprehensiveJson.success) {
      setComprehensiveData(comprehensiveJson.data);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Error loading analytics</p>
          <p className="text-sm text-muted mt-2">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!basicData || !comprehensiveData) {
    return null;
  }

  const totalOrders = comprehensiveData.orderStatusCounts.reduce((sum, status) => sum + status.count, 0);
  const ordersByStatus = comprehensiveData.orderStatusCounts.map(status => ({
    name: status._id,
    value: status.count,
  }));

  const kpiCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${comprehensiveData.totalRevenue.toLocaleString()}`, 
      change: '+12.5%', 
      icon: DollarSign 
    },
    { 
      title: 'Total Orders', 
      value: totalOrders.toLocaleString(), 
      change: '+8.3%', 
      icon: ShoppingBag 
    },
    { 
      title: 'Active Vendors', 
      value: basicData.approvedVendors.toString(), 
      change: `${basicData.pendingVendors} pending`, 
      icon: Users 
    },
    { 
      title: 'Active Users', 
      value: basicData.totalUsers.toLocaleString(), 
      change: `+${comprehensiveData.newUsersLast7Days} this week`, 
      icon: TrendingUp 
    },
  ];

  const exportVendorsCsv = () => {
    exportToCSV({
      data: comprehensiveData.topVendors.map(v => ({ 
        vendor: v.vendorName, 
        orders: v.orderCount 
      })),
      filename: 'vendor_performance.csv',
      headers: [
        { key: 'vendor', label: 'Vendor' },
        { key: 'orders', label: 'Orders' },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted">Platform insights and performance metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-green-600">{kpi.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Orders by Status</CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </div>
                 <button
                    type="button"
                    onClick={fetchOrdersCSV}
                    className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Export CSV
                  </button>

              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={ordersByStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                      {ordersByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
                <CardDescription>Overall order metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {comprehensiveData.orderStatusCounts.map((status, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{status._id}</p>
                      <p className="text-sm text-muted">
                        {((status.count / totalOrders) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{status.count}</p>
                      <Badge variant="outline">orders</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Top performing vendors by order count</div>
            <button
              type="button"
              onClick={exportVendorsCsv}
              className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Export CSV
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Overview</CardTitle>
                <CardDescription>Total vendor statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Total Vendors</p>
                    <p className="text-sm text-muted">{basicData.totalVendors} registered</p>
                  </div>
                  <div className="text-2xl font-bold">{basicData.totalVendors}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Approved Vendors</p>
                    <p className="text-sm text-muted">
                      {((basicData.approvedVendors / basicData.totalVendors) * 100).toFixed(1)}% approval rate
                    </p>
                  </div>
                  <div className="w-1/2">
                    <Progress value={(basicData.approvedVendors / basicData.totalVendors) * 100} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pending Approval</p>
                    <p className="text-sm text-muted">{basicData.pendingVendors} vendors</p>
                  </div>
                  <Badge variant="outline">{basicData.pendingVendors}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
                <CardDescription>By order count</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {comprehensiveData.topVendors.map((v, idx) => (
                    <li key={v.vendorName} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{v.vendorName}</p>
                        <p className="text-sm text-muted">{v.orderCount} orders</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">#{idx + 1}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{basicData.totalUsers}</div>
                <p className="text-sm text-muted mt-2">All time registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{comprehensiveData.newUsersLast7Days}</div>
                <p className="text-sm text-green-600 mt-2">
                  {((comprehensiveData.newUsersLast7Days / basicData.totalUsers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Weekly trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  +{comprehensiveData.newUsersLast7Days}
                </div>
                <p className="text-sm text-muted mt-2">New signups this week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}