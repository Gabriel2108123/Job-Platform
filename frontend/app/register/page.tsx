'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { setCurrentUser } from '@/lib/auth-helpers';
import type { CurrentUser } from '@/lib/auth-helpers';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account Type State
  const [accountType, setAccountType] = useState<'candidate' | 'business'>('candidate');

  // Form State
  const [formData, setFormData] = useState({
    // Common
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '', // Country of Residence (Employee) or Registration (Business)

    // Employee Specific
    primaryRole: '',
    currentStatus: '',
    referralCode: '',
    isOver16: false,

    // Business Specific
    registeredCompanyName: '',
    tradingName: '',
    workEmail: '', // Should be same as email for now
    businessType: '',
    vatNumber: '',
    discountCode: '',
    authorizedToHire: false,

    // Legal
    agreedToTerms: false,
    agreedToPrivacy: false,
  });

  // Clear form on mount
  useEffect(() => {
    setError(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement; // Type assertion for checkbox property
    const { name, value, type } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  const handleAccountTypeChange = (type: 'candidate' | 'business') => {
    setAccountType(type);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic Validation
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Email and password are required');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
        throw new Error('You must agree to the Terms and Privacy Policy');
      }

      // Role specific validation
      if (accountType === 'candidate') {
        if (!formData.firstName || !formData.lastName) throw new Error('First and Last name are required');
        if (!formData.isOver16) throw new Error('You must confirm you are over 16');
      } else {
        if (!formData.registeredCompanyName) throw new Error('Registered Company Name is required');
        if (!formData.authorizedToHire) throw new Error('You must confirm you are authorized to hire');
      }

      // Prepare payload
      const payload: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        agreedToTerms: formData.agreedToTerms,
        agreedToPrivacy: formData.agreedToPrivacy,
        Role: accountType === 'business' ? 'BusinessOwner' : 'Candidate',
      };

      if (accountType === 'candidate') {
        payload.CountryOfResidence = formData.country;
        payload.PrimaryRole = formData.primaryRole;
        payload.CurrentStatus = formData.currentStatus;
        payload.ReferralCode = formData.referralCode;
        payload.IsOver16 = formData.isOver16;
      } else {
        payload.OrganizationName = formData.registeredCompanyName;
        payload.TradingName = formData.tradingName;
        payload.CountryOfRegistration = formData.country;
        payload.VATNumber = formData.vatNumber;
        payload.DiscountCode = formData.discountCode;
        payload.AuthorizedToHire = formData.authorizedToHire;
      }

      // Call register endpoint
      const response = await authApi.register(payload);

      if (response.success && response.data) {
        const { token, user } = response.data;
        const currentUser: CurrentUser = {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          organizationId: user.organizationId,
          role: user.role || 'Candidate',
        };

        setCurrentUser(currentUser, token); // This function stores token in cookie

        if (response.success) {
          router.push('/register/verify-email');
        }
      } else {
        setError(response.error || 'Registration failed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Theme helpers
  const isCandidate = accountType === 'candidate';
  const themeClasses = isCandidate
    ? 'bg-neutral-950 text-white'
    : 'bg-gray-50 text-gray-900';

  const cardClasses = isCandidate
    ? 'bg-neutral-900 border-neutral-800 text-white shadow-xl'
    : 'bg-white shadow-md border-gray-100';

  const inputLabelClasses = isCandidate
    ? 'text-gray-300'
    : 'text-gray-700';

  return (
    <div className={`min-h-screen py-12 transition-colors duration-500 ${themeClasses}`}>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/images/yoke-logo-full.jpg"
              alt="YokeConnect Logo"
              className="h-20"
            />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isCandidate ? 'text-[var(--brand-gold)]' : 'text-[var(--brand-navy)]'}`}>
            Create Account
          </h1>
          <p className={isCandidate ? 'text-gray-400' : 'text-gray-600'}>
            Join the hospitality community
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Account Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
            <button
              type="button"
              onClick={() => handleAccountTypeChange('candidate')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${accountType === 'candidate'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              I want to Work
            </button>
            <button
              type="button"
              onClick={() => handleAccountTypeChange('business')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${accountType === 'business'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              I want to Hire
            </button>
          </div>
        </div>

        <Card className={`${cardClasses} transition-colors duration-300`}>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">

              {/* --- Account Basics --- */}
              <div className="space-y-4">
                <h3 className={`text-lg font-medium border-b pb-2 ${isCandidate ? 'text-white border-neutral-700' : 'text-gray-900 border-gray-100'}`}>Account Basics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>First Name *</label>
                    <Input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Last Name *</label>
                    <Input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Email Address *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Password *</label>
                    <Input name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Confirm Password *</label>
                    <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>
                    {accountType === 'candidate' ? 'Country of Residence *' : 'Country of Registration *'}
                  </label>
                  <Input name="country" value={formData.country} onChange={handleInputChange} required placeholder="e.g. United Kingdom" />
                </div>
              </div>

              {/* --- Role Specific Fields --- */}

              {accountType === 'candidate' && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-medium border-b pb-2 ${isCandidate ? 'text-white border-neutral-700' : 'text-gray-900 border-gray-100'}`}>Profile Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Primary Role</label>
                      <select
                        name="primaryRole"
                        value={formData.primaryRole}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 text-sm p-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                      >
                        <option value="">Select Role...</option>
                        <option value="Chef">Chef</option>
                        <option value="Bartender">Bartender</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Manager">F&B Manager</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Receptionist">Receptionist</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Current Status</label>
                      <select
                        name="currentStatus"
                        value={formData.currentStatus}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 text-sm p-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                      >
                        <option value="">Select Status...</option>
                        <option value="Available">Available</option>
                        <option value="Employed">Employed</option>
                        <option value="Seasonal">Seasonal</option>
                        <option value="Relocating">Relocating soon</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Phone Number (Optional)</label>
                    <Input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+44 7000 000000" />
                  </div>

                  {/* Commercial / Referral */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Referral Code (Optional)</label>
                    <Input name="referralCode" value={formData.referralCode} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {accountType === 'business' && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-medium border-b pb-2 ${isCandidate ? 'text-white border-neutral-700' : 'text-gray-900 border-gray-100'}`}>Company Details</h3>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Registered Company Name *</label>
                    <Input name="registeredCompanyName" value={formData.registeredCompanyName} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Trading Name (if different)</label>
                    <Input name="tradingName" value={formData.tradingName} onChange={handleInputChange} />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Business Type</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 text-sm p-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                    >
                      <option value="">Select Type...</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Bar">Bar / Pub</option>
                      <option value="Cafe">Cafe</option>
                      <option value="Resort">Resort</option>
                      <option value="Cruise">Cruise Line</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>VAT Number (Optional)</label>
                    <Input name="vatNumber" value={formData.vatNumber} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${inputLabelClasses}`}>Phone Number</label>
                    <Input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} required />
                  </div>
                </div>
              )}

              {/* --- Legal --- */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-[var(--brand-primary)] rounded border-gray-300 focus:ring-[var(--brand-primary)]"
                    required
                  />
                  <span className="text-sm text-gray-600">I accept the <Link href="/terms" className="text-[var(--brand-primary)] hover:underline">Terms & Conditions</Link>.</span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreedToPrivacy"
                    checked={formData.agreedToPrivacy}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-[var(--brand-primary)] rounded border-gray-300 focus:ring-[var(--brand-primary)]"
                    required
                  />
                  <span className="text-sm text-gray-600">I accept the <Link href="/privacy" className="text-[var(--brand-primary)] hover:underline">Privacy Policy</Link>.</span>
                </label>

                {accountType === 'candidate' && (
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="isOver16"
                      checked={formData.isOver16}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-[var(--brand-primary)] rounded border-gray-300 focus:ring-[var(--brand-primary)]"
                      required
                    />
                    <span className="text-sm text-gray-600">I confirm I am over 16 years of age.</span>
                  </label>
                )}

                {accountType === 'business' && (
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="authorizedToHire"
                      checked={formData.authorizedToHire}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-[var(--brand-primary)] rounded border-gray-300 focus:ring-[var(--brand-primary)]"
                      required
                    />
                    <span className="text-sm text-gray-600">I confirm I am authorized to hire for this business.</span>
                  </label>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--brand-primary)] hover:underline font-medium">
                  Log in here
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link href="/jobs" className="text-[var(--brand-primary)] hover:underline text-sm">
            Browse jobs as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
