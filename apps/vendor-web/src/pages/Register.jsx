import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { registerVendor } from '../api/vendor';

export default function Register() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    businessName: '',
    address: '',
    phone: '',
    cuisineType: '',
    avgPrepTime: '',
    businessLicense: null,
    foodSafetyCertificate: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await registerVendor({ token: user?.token, data: { ...form } });
      setMessage('Submitted! Your application is pending admin review.');
      setMessageType('success');
      setForm({
        businessName: '', address: '', phone: '', cuisineType: '', avgPrepTime: '',
        businessLicense: null, foodSafetyCertificate: null,
      });
    } catch (err) {
      setMessage(err.message || 'Failed to submit registration');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Vendor Registration</h1>
      <p className="mb-6 text-sm text-gray-500">Provide your business details and upload required documents for admin approval.</p>

      <Alert type={messageType} message={message} />

      <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600">Business Name</label>
            <input name="businessName" value={form.businessName} onChange={onChange} required className="mt-1 w-full rounded-md border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} required className="mt-1 w-full rounded-md border border-gray-300 p-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600">Address</label>
            <input name="address" value={form.address} onChange={onChange} required className="mt-1 w-full rounded-md border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Cuisine Type</label>
            <input name="cuisineType" value={form.cuisineType} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Avg Prep Time (mins)</label>
            <input name="avgPrepTime" type="number" value={form.avgPrepTime} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600">Business License (PDF/Image)</label>
            <input name="businessLicense" type="file" accept=".pdf,image/*" onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Food Safety Certificate (PDF/Image)</label>
            <input name="foodSafetyCertificate" type="file" accept=".pdf,image/*" onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 p-2" />
          </div>
        </div>

        <div className="pt-2">
          <button disabled={submitting} type="submit" className="inline-flex items-center rounded-md bg-[#ff6600] px-4 py-2 text-white hover:bg-[#e65c00] disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}