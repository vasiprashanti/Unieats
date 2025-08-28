import React from 'react';
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
import { DollarSign, ShoppingBag, Users, TrendingUp, Star, Clock } from 'lucide-react';
import { mockAdminAnalytics } from '@/data/adminMockData';
import { exportToCSV } from '@/utils/csvExport';

export default function Analytics() {
  const analytics = mockAdminAnalytics;
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const kpiCards = [
    { title: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, change: `+${analytics.revenueGrowth}%`, icon: DollarSign },
    { title: 'Total Orders', value: analytics.totalOrders.toLocaleString(), change: `+${analytics.orderGrowth}%`, icon: ShoppingBag },
    { title: 'Active Vendors', value: analytics.activeVendors.toString(), change: '+5.2%', icon: Users },
    { title: 'Active Users', value: analytics.activeUsers.toLocaleString(), change: '+8.1%', icon: TrendingUp },
  ];

  const exportRevenueCsv = () => {
    exportToCSV({
      data: analytics.dailyRevenue.map(d => ({ date: d.date, revenue: d.revenue, orders: d.orders })),
      filename: 'revenue_trends.csv',
      headers: [
        { key: 'date', label: 'Date' },
        { key: 'revenue', label: 'Revenue (INR)' },
        { key: 'orders', label: 'Orders' },
      ],
    });
  };

  const exportVendorsCsv = () => {
    exportToCSV({
      data: analytics.topVendors.map(v => ({ vendor: v.name, orders: v.orders, revenue: v.revenue })),
      filename: 'vendor_performance.csv',
      headers: [
        { key: 'vendor', label: 'Vendor' },
        { key: 'orders', label: 'Orders' },
        { key: 'revenue', label: 'Revenue (INR)' },
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
        {/* Global export if needed */}
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
                <p className="text-xs text-green-600">{kpi.change} from last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Revenue trends over the last 7 days</div>
            <button
              type="button"
              onClick={exportRevenueCsv}
              className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Export CSV
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue trends over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).getDate().toString()} />
                    <YAxis />
                    <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
                <CardDescription>Highest revenue generating vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topVendors.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted">{vendor.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{vendor.revenue.toLocaleString()}</p>
                        <Badge variant="outline">{index + 1} place</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Order volume over the last 7 days</div>
            <button
              type="button"
              onClick={() => exportToCSV({
                data: analytics.dailyRevenue.map(d => ({ date: d.date, orders: d.orders })),
                filename: 'orders_trends.csv',
                headers: [
                  { key: 'date', label: 'Date' },
                  { key: 'orders', label: 'Orders' },
                ],
              })}
              className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Export CSV
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Orders</CardTitle>
                <CardDescription>Order volume over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).getDate().toString()} />
                    <YAxis />
                    <Tooltip formatter={(v) => [v, 'Orders']} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Orders by Status</CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => exportToCSV({
                    data: analytics.ordersByStatus.map(s => ({ status: s.name, value: s.value })),
                    filename: 'orders_by_status.csv',
                    headers: [
                      { key: 'status', label: 'Status' },
                      { key: 'value', label: 'Count (%)' },
                    ],
                  })}
                  className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Export CSV
                </button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analytics.ordersByStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                      {analytics.ordersByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Vendor performance by revenue</div>
            <button
              type="button"
              onClick={exportVendorsCsv}
              className="px-3 py-2 rounded border border-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Export CSV
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Vendor Metrics</CardTitle>
                <CardDescription>Key vendor performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Active Vendors</p>
                    <p className="text-sm text-muted">{analytics.vendorMetrics.active.current}/{analytics.vendorMetrics.active.total}</p>
                  </div>
                  <div className="w-1/2">
                    <Progress value={(analytics.vendorMetrics.active.current / analytics.vendorMetrics.active.total) * 100} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vendor Approval Rate</p>
                    <p className="text-sm text-muted">{analytics.vendorMetrics.approvalRate}%</p>
                  </div>
                  <div className="w-1/2">
                    <Progress value={analytics.vendorMetrics.approvalRate} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Average Rating</p>
                    <p className="text-sm text-muted">{analytics.vendorMetrics.avgRating}/5</p>
                  </div>
                  <div className="w-1/2">
                    <Progress value={(analytics.vendorMetrics.avgRating / 5) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
                <CardDescription>By revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analytics.topVendors.map((v, idx) => (
                    <li key={v.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-sm text-muted">{v.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{v.revenue.toLocaleString()}</p>
                        <Badge variant="outline">{idx + 1} place</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Average Order Value</CardTitle>
                  <CardDescription>Amount per order</CardDescription>
                </div>
                <DollarSign className="h-5 w-5 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{analytics.averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-green-600">+4.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Average Delivery Time</CardTitle>
                  <CardDescription>Door to door</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgDeliveryTimeMin} min</div>
                <p className="text-xs text-red-600">+2 min from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Satisfaction</CardTitle>
                  <CardDescription>Average rating</CardDescription>
                </div>
                <Star className="h-5 w-5 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.customerSatisfaction.toFixed(1)}/5</div>
                <p className="text-xs text-green-600">+0.1 from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
              <CardDescription>Overall platform performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Order Success Rate</p>
                    <p className="text-sm text-muted">{analytics.platformHealth.orderSuccessRate}%</p>
                  </div>
                  <Progress value={analytics.platformHealth.orderSuccessRate} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Customer Retention</p>
                    <p className="text-sm text-muted">{analytics.platformHealth.customerRetention}%</p>
                  </div>
                  <Progress value={analytics.platformHealth.customerRetention} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Payment Success Rate</p>
                    <p className="text-sm text-muted">{analytics.platformHealth.paymentSuccessRate}%</p>
                  </div>
                  <Progress value={analytics.platformHealth.paymentSuccessRate} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">App Uptime</p>
                  <p>{analytics.platformHealth.appUptime}%</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium">API Response Time</p>
                  <p>{analytics.platformHealth.apiResponseTimeMs}ms</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium">Error Rate</p>
                  <p>{analytics.platformHealth.errorRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}