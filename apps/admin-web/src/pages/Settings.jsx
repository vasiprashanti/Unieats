import React, { useMemo, useState, useEffect } from "react";
import { Save, CreditCard, Bell, Percent, Zap } from "lucide-react";
import { useToast } from "../components/ui/Toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { auth } from "../config/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    paymentGateway: { razorpay: true, stripe: false, paypal: false },
    delivery: { deliveryFee: "" },
    commission: { rate: "", platformFee: "" },
    secrets: { razorpayKeyId: "", razorpayKeySecret: "" },
    notifications: { email: true, sms: true, push: true },
    features: { chatSupport: true, reviews: true, scheduledOrders: false },
    system: { timezone: 'UTC', currency: 'INR (₹)', orderTimeout: 30, maxDeliveryKm: 10 },
  });
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { push: toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        
        setSettings(prev => ({
          ...prev,
          delivery: {
            deliveryFee: data.deliveryFee?.toString() || "",
          },
          commission: {
            rate: data.defaultCommissionRate ? (data.defaultCommissionRate * 100).toFixed(2) : "",
            platformFee: data.platformFee?.toString() || "",
          },
          system: {
            timezone: data.timezone || prev.system.timezone,
            currency: data.currency ? `${data.currency} (₹)` : prev.system.currency,
            orderTimeout: data.orderTimeout || prev.system.orderTimeout,
            maxDeliveryKm: data.maxDeliveryKm || prev.system.maxDeliveryKm,
          },
          paymentGateway: {
            razorpay: data.paymentGateway?.toLowerCase().includes('razorpay') || false,
            stripe: data.paymentGateway?.toLowerCase().includes('stripe') || false,
            paypal: data.paymentGateway?.toLowerCase().includes('paypal') || false,
          },
          notifications: {
            email: data.notifications?.email ?? prev.notifications.email,
            sms: data.notifications?.sms ?? prev.notifications.sms,
            push: data.notifications?.push ?? prev.notifications.push,
          },
          features: {
            chatSupport: data.features?.chatSupport ?? prev.features.chatSupport,
            reviews: data.features?.reviews ?? prev.features.reviews,
            scheduledOrders: data.features?.scheduledOrders ?? prev.features.scheduledOrders,
          },
        }));
      }
    } catch (err) {
      toast({ 
        type: 'error', 
        title: 'Failed to load settings', 
        message: err?.message || 'Could not fetch settings from server' 
      });
    } finally {
      setFetching(false);
    }
  }

  const errors = useMemo(() => {
    const e = {};
    const fee = Number(settings.delivery.deliveryFee);
    
    if (settings.delivery.deliveryFee === "" || Number.isNaN(fee) || fee < 0) {
      e.deliveryFee = "Delivery fee must be a non-negative number";
    }
    
    const cr = Number(settings.commission.rate);
    
    if (settings.commission.rate === "" || Number.isNaN(cr) || cr < 0 || cr > 100) {
      e.rate = "Commission rate must be 0–100";
    }
    
    return e;
  }, [settings]);

  const isValid = Object.keys(errors).length === 0;
  
  const updateSetting = (category, key, value) => setSettings((prev) => ({ ...prev, [category]: { ...prev[category], [key]: value } }));

  async function handleSave() {
    if (!isValid) {
      toast({ type: 'error', title: 'Please fix validation', message: 'Check commission, delivery fee, and required credentials.' });
      return;
    }
    
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const payload = {
        deliveryFee: Number(settings.delivery.deliveryFee),
        commissionRate: Number(settings.commission.rate) / 100,
        platformFee: Number(settings.commission.platformFee || 0),
        currency: 'INR',
        paymentGateway: settings.paymentGateway.razorpay 
          ? 'Razorpay' 
          : settings.paymentGateway.stripe 
          ? 'Stripe' 
          : settings.paymentGateway.paypal 
          ? 'PayPal' 
          : 'UPI Manual',
        timezone: settings.system.timezone,
        orderTimeout: Number(settings.system.orderTimeout),
        maxDeliveryKm: Number(settings.system.maxDeliveryKm),
        notifications: settings.notifications,
        features: settings.features,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save settings: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({ type: 'success', title: 'Settings Saved', message: 'Your settings have been saved successfully.' });
        await fetchSettings();
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }
    } catch (err) {
      toast({ type: 'error', title: 'Save failed', message: err?.message || 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted">Configure platform settings and preferences</p>
        </div>
        <Button className="btn btn-primary" onClick={handleSave} disabled={loading || fetching}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Gateways</span>
              </CardTitle>
              <CardDescription>Configure payment processing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="razorpay">Razorpay</Label>
                <Switch id="razorpay" checked={settings.paymentGateway.razorpay} onCheckedChange={(v) => updateSetting('paymentGateway', 'razorpay', v)} disabled={loading} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="stripe">Stripe</Label>
                <Switch id="stripe" checked={settings.paymentGateway.stripe} onCheckedChange={(v) => updateSetting('paymentGateway', 'stripe', v)} disabled={loading} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="paypal">PayPal</Label>
                <Switch id="paypal" checked={settings.paymentGateway.paypal} onCheckedChange={(v) => updateSetting('paymentGateway', 'paypal', v)} disabled={loading} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotif">Email Notifications</Label>
                <Switch id="emailNotif" checked={settings.notifications.email} onCheckedChange={(v) => updateSetting('notifications', 'email', v)} disabled={loading} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotif">SMS Notifications</Label>
                <Switch id="smsNotif" checked={settings.notifications.sms} onCheckedChange={(v) => updateSetting('notifications', 'sms', v)} disabled={loading} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotif">Push Notifications</Label>
                <Switch id="pushNotif" checked={settings.notifications.push} onCheckedChange={(v) => updateSetting('notifications', 'push', v)} disabled={loading} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Percent className="h-5 w-5" />
                <span>Commission & Fees</span>
              </CardTitle>
              <CardDescription>Configure platform commission rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vendorCommission">Vendor Commission (%)</Label>
                <Input id="vendorCommission" type="number" step="0.01" min="0" max="100" value={settings.commission.rate} onChange={(e) => updateSetting('commission', 'rate', e.target.value)} disabled={loading} />
                {errors.rate && <p className="text-xs text-red-600 mt-1">{errors.rate}</p>}
              </div>
              <div>
                <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
                <Input id="deliveryFee" type="number" step="0.01" min="0" value={settings.delivery.deliveryFee} onChange={(e) => updateSetting('delivery', 'deliveryFee', e.target.value)} disabled={loading} />
                {errors.deliveryFee && <p className="text-xs text-red-600 mt-1">{errors.deliveryFee}</p>}
              </div>
              <div>
                <Label htmlFor="platformFee">Platform Fee (₹)</Label>
                <Input id="platformFee" type="number" step="0.01" min="0" value={settings.commission.platformFee} onChange={(e) => updateSetting('commission', 'platformFee', e.target.value)} disabled={loading} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Platform Features</span>
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="chatSupport">Chat Support</Label>
                <Switch id="chatSupport" checked={settings.features.chatSupport} onCheckedChange={(v) => updateSetting('features', 'chatSupport', v)} disabled={loading} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="reviews">Customer Reviews</Label>
                <Switch id="reviews" checked={settings.features.reviews} onCheckedChange={(v) => updateSetting('features', 'reviews', v)} disabled={loading} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="scheduled">Scheduled Orders</Label>
                <Switch id="scheduled" checked={settings.features.scheduledOrders} onCheckedChange={(v) => updateSetting('features', 'scheduledOrders', v)} disabled={loading} />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input id="timezone" value={settings.system.timezone} onChange={(e) => updateSetting('system', 'timezone', e.target.value)} disabled={loading} />
              </div>
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" value="INR (₹)" readOnly disabled />
              </div>
              <div>
                <Label htmlFor="timeout">Order Timeout (minutes)</Label>
                <Input id="timeout" type="number" min="0" value={settings.system.orderTimeout} onChange={(e) => updateSetting('system', 'orderTimeout', e.target.value)} disabled={loading} />
              </div>
              <div>
                <Label htmlFor="maxKm">Max Delivery Distance (km)</Label>
                <Input id="maxKm" type="number" min="0" value={settings.system.maxDeliveryKm} onChange={(e) => updateSetting('system', 'maxDeliveryKm', e.target.value)} disabled={loading} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}