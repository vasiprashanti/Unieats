import React from "react";

// Minimal UI primitives to avoid external dependencies
function Card({ children, className = "" }) {
  return (
    <div className={`card border border-base rounded-xl ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 border-b border-base ${className}`}>
      {children}
    </div>
  );
}
function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
function CardDescription({ children, className = "" }) {
  return <p className={`text-sm text-muted ${className}`}>{children}</p>;
}
function CardContent({ children, className = "" }) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>;
}

function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "btn-primary",
    secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]",
    outline: "border border-base text-[hsl(var(--foreground))]",
    destructive: "bg-red-600 text-white",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

function Progress({ value = 0, className = "" }) {
  return (
    <div className={`w-full bg-[hsl(var(--muted))] rounded-full ${className}`}>
      <div
        className="bg-[hsl(var(--primary))] h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

// Inline lucide-like icons (stroke-based)
function IconBase({ children, className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const DollarSign = (props) => (
  <IconBase {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </IconBase>
);
const ShoppingBag = (props) => (
  <IconBase {...props}>
    <path d="M6 2l1 4h10l1-4" />
    <path d="M3 6h18l-1.5 14a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-1.8L3 6z" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </IconBase>
);
const UsersIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconBase>
);
const TrendingUp = (props) => (
  <IconBase {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </IconBase>
);
const AlertTriangle = (props) => (
  <IconBase {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </IconBase>
);
const Clock = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconBase>
);

export default function Dashboard() {
  const stats = [
    { title: "Total Revenue", value: "$125,430", change: "+12.5%", icon: DollarSign, trend: "up" },
    { title: "Total Orders", value: "1,250", change: "+8.2%", icon: ShoppingBag, trend: "up" },
    { title: "Active Users", value: "2,340", change: "+15.3%", icon: UsersIcon, trend: "up" },
    { title: "Conversion Rate", value: "3.2%", change: "-2.1%", icon: TrendingUp, trend: "down" },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", vendor: "Pizza Palace", amount: "$45.99", status: "delivered" },
    { id: "ORD-002", customer: "Sarah Wilson", vendor: "Burger Barn", amount: "$32.50", status: "preparing" },
    { id: "ORD-003", customer: "Mike Chen", vendor: "Sushi Zen", amount: "$67.80", status: "placed" },
    { id: "ORD-004", customer: "Lisa Wang", vendor: "Taco Time", amount: "$28.90", status: "ready" },
  ];

  const alerts = [
    { type: "warning", message: "3 vendors pending approval", icon: AlertTriangle },
    { type: "info", message: "System maintenance scheduled for tonight", icon: Clock },
    { type: "error", message: "Payment gateway error reported", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted">{order.customer} • {order.vendor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <Badge
                      variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'preparing' ? 'secondary' :
                        order.status === 'ready' ? 'outline' : 'destructive'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Important updates and system alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon
                      className={`h-5 w-5 ${
                        alert.type === 'error' ? 'text-red-500' :
                        alert.type === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`}
                    />
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">{alert.message}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Key platform metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted">Order Completion Rate</span>
                <span className="text-sm font-medium">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted">Customer Satisfaction</span>
                <span className="text-sm font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted">Vendor Approval Rate</span>
                <span className="text-sm font-medium">76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}