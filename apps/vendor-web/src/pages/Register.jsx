import React, { useState } from 'react';
import Alert from '../components/Alert';
import { registerVendor } from '../api/vendor';

// Vendor Registration Page
// - Collects vendor business details
// - Allows uploading at least one document
// - Basic required-field validation + password match
// - Shows selected file names for feedback
export default function Register() {
  const [form, setForm] = useState({
    restaurantName: '',
    address: '',
    phone: '',
    cuisineType: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessLicense: null, // required: at least one of the files
    additionalDocument: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.restaurantName?.trim()) next.restaurantName = 'Restaurant name is required';
    if (!form.address?.trim()) next.address = 'Business address is required';
    if (!form.phone?.trim()) next.phone = 'Contact phone number is required';
    if (!form.cuisineType?.trim()) next.cuisineType = 'Cuisine type is required';
    if (!form.email?.trim()) next.email = 'Email is required';
    if (!form.password) next.password = 'Password is required';
    if (!form.confirmPassword) next.confirmPassword = 'Confirm your password';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    if (!form.businessLicense && !form.additionalDocument) {
      next.documents = 'Please upload at least one document';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('error');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await registerVendor({
        token: undefined, // public registration; no auth token
        data: {
          restaurantName: form.restaurantName,
          address: form.address,
          phone: form.phone,
          cuisineType: form.cuisineType,
          email: form.email,
          password: form.password,
          businessLicense: form.businessLicense,
          additionalDocument: form.additionalDocument,
        },
      });
      setMessage('Submitted! Your application is pending admin review.');
      setMessageType('success');
      setForm({
        restaurantName: '', address: '', phone: '', cuisineType: '', email: '', password: '', confirmPassword: '',
        businessLicense: null, additionalDocument: null,
      });
      setErrors({});
    } catch (err) {
      setMessage(err?.message || 'Failed to submit registration');
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

      <form onSubmit={onSubmit} className="space-y-6" encType="multipart/form-data">
        {/* Business information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600">Restaurant Name</label>
            <input
              name="restaurantName"
              value={form.restaurantName}
              onChange={onChange}
              required
              className={`mt-1 w-full rounded-md border p-2 ${errors.restaurantName ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.restaurantName ? (<p className="mt-1 text-xs text-red-600">{errors.restaurantName}</p>) : null}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Contact Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              required
              className={`mt-1 w-full rounded-md border p-2 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.phone ? (<p className="mt-1 text-xs text-red-600">{errors.phone}</p>) : null}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600">Business Address</label>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              required
              className={`mt-1 w-full rounded-md border p-2 ${errors.address ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.address ? (<p className="mt-1 text-xs text-red-600">{errors.address}</p>) : null}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Cuisine Type</label>
            <select
              name="cuisineType"
              value={form.cuisineType}
              onChange={onChange}
              required
              className={`mt-1 w-full rounded-md border p-2 bg-white ${errors.cuisineType ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="" disabled>Select cuisine</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Indian">Indian</option>
              <option value="Chinese">Chinese</option>
              <option value="American">American</option>
              <option value="Thai">Thai</option>
              <option value="Japanese">Japanese</option>
              <option value="Bakery">Bakery</option>
            </select>
            {errors.cuisineType ? (<p className="mt-1 text-xs text-red-600">{errors.cuisineType}</p>) : null}
          </div>
        </div>

        {/* Account credentials */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className={`mt-1 w-full rounded-md border p-2 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.email ? (<p className="mt-1 text-xs text-red-600">{errors.email}</p>) : null}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              className={`mt-1 w-full rounded-md border p-2 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.password ? (<p className="mt-1 text-xs text-red-600">{errors.password}</p>) : null}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              required
              className={`mt-1 w-full rounded-md border p-2 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.confirmPassword ? (<p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>) : null}
          </div>
        </div>

        {/* Documents */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600">Business License (PDF/Image)</label>
            <input
              name="businessLicense"
              type="file"
              accept=".pdf,image/*"
              onChange={onChange}
              className={`mt-1 w-full rounded-md border p-2 ${errors.documents ? 'border-red-400' : 'border-gray-300'}`}
            />
            {form.businessLicense ? (
              <p className="mt-1 text-xs text-gray-600">Selected: {form.businessLicense.name}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Additional Document (PDF/Image)</label>
            <input
              name="additionalDocument"
              type="file"
              accept=".pdf,image/*"
              onChange={onChange}
              className={`mt-1 w-full rounded-md border p-2 ${errors.documents ? 'border-red-400' : 'border-gray-300'}`}
            />
            {form.additionalDocument ? (
              <p className="mt-1 text-xs text-gray-600">Selected: {form.additionalDocument.name}</p>
            ) : null}
          </div>
        </div>
        {errors.documents ? (<p className="-mt-2 text-xs text-red-600">{errors.documents}</p>) : null}

        <div className="pt-2">
          <button
            disabled={submitting}
            type="submit"
            className="inline-flex items-center rounded-md bg-[#ff6600] px-4 py-2 text-white hover:bg-[#e65c00] disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}