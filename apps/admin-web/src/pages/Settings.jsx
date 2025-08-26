import React, { useMemo, useState } from "react";
import { Save, CreditCard, Bell, Percent, Zap } from "lucide-react";
import { saveSettings } from "../api/admin";
import { useToast } from "../components/ui/Toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    paymentGateway: { razorpay: true, stripe: false, paypal: false },
    delivery: { deliveryFee: "" },
    commission: { rate: "" },
    secrets: { razorpayKeyId: "", razorpayKeySecret: "" },
    notifications: { email: true, sms: true, push: true },
    features: { chatSupport: true, reviews: true, scheduledOrders: false },
    system: { timezone: 'UTC', currency: 'INR (₹)', orderTimeout: 30, maxDeliveryKm: 10 },
  });
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);
  const { push: toast } = useToast();

  const errors = useMemo(() => {
    const e = {};
    const fee = Number(settings.delivery.deliveryFee);
    if (settings.delivery.deliveryFee === "" || Number.isNaN(fee) || fee < 0) e.deliveryFee = "Delivery fee must be a non-negative number";
    const cr = Number(settings.commission.rate);
    if (settings.commission.rate === "" || Number.isNaN(cr) || cr < 0 || cr > 100) e.rate = "Commission rate must be 0–100";
    // Only require Razorpay keys when Razorpay is enabled
    if (settings.paymentGateway.razorpay) {
      if (!settings.secrets.razorpayKeyId.trim()) e.keyId = "Key ID is required";
      if (!settings.secrets.razorpayKeySecret.trim()) e.keySecret = "Key Secret is required";
    }
    return e;
  }, [settings]);

  const isValid = Object.keys(errors).length === 0;
  const updateSetting = (category, key, value) => setSettings((prev) => ({ ...prev, [category]: { ...prev[category], [key]: value } }));

  async function handleSave() {
    // If invalid, show a toast but still allow manual fix
    if (!isValid) {
      toast({ type: 'error', title: 'Please fix validation', message: 'Check commission, delivery fee, and required credentials.' });
      // continue; you might still want to save partial non-sensitive changes
    }
    setLoading(true);
    try {
      await saveSettings({
        razorpayKeyId: settings.secrets.razorpayKeyId,
        razorpayKeySecret: settings.secrets.razorpayKeySecret,
        currency: 'INR',
        deliveryFee: Number(settings.delivery.deliveryFee),
        commissionRate: Number(settings.commission.rate),
        platformFee: Number(settings.commission.platformFee || 0),
        gateways: settings.paymentGateway,
        notifications: settings.notifications,
        features: settings.features,
        system: { ...settings.system, currency: 'INR (₹)' },
      });
      toast({ type: 'success', title: 'Settings Saved', message: 'Your settings have been saved successfully.' });
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
        <Button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Gateway Settings */}
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

        {/* Notifications */}
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

        {/* Commission & Fees */}
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
              <Input id="vendorCommission" type="number" step="0.01" min="0" max="100" value={settings.commission.rate} onChange={(e) => updateSetting('commission', 'rate', e.target.value)} />
              {errors.rate && <p className="text-xs text-red-600 mt-1">{errors.rate}</p>}
            </div>
            <div>
              <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
              <Input id="deliveryFee" type="number" step="0.01" min="0" value={settings.delivery.deliveryFee} onChange={(e) => updateSetting('delivery', 'deliveryFee', e.target.value)} />
              {errors.deliveryFee && <p className="text-xs text-red-600 mt-1">{errors.deliveryFee}</p>}
            </div>
            <div>
              <Label htmlFor="platformFee">Platform Fee (₹)</Label>
              <Input id="platformFee" type="number" step="0.01" min="0" value={settings.commission.platformFee ?? ''} onChange={(e) => updateSetting('commission', 'platformFee', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
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

        {/* System Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Advanced system settings</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Default Timezone</Label>
              <Input id="timezone" value={settings.system.timezone} onChange={(e) => updateSetting('system', 'timezone', e.target.value)} />
            </div>
            {/* Currency is fixed as INR */}
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" value="INR (₹)" readOnly disabled />
            </div>
            <div>
              <Label htmlFor="timeout">Order Timeout (minutes)</Label>
              <Input id="timeout" type="number" min="0" value={settings.system.orderTimeout} onChange={(e) => updateSetting('system', 'orderTimeout', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="maxKm">Max Delivery Distance (km)</Label>
              <Input id="maxKm" type="number" min="0" value={settings.system.maxDeliveryKm} onChange={(e) => updateSetting('system', 'maxDeliveryKm', e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}