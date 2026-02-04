'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    accountType: 'candidate', // 'candidate' or 'business'
    organizationName: '',
  });

  // Clear form on mount to ensure fresh start
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      accountType: 'candidate',
      organizationName: '',
    });
    setError(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Email, password, and password confirmation are required');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }

      // Validate business owner requirements
      if (formData.accountType === 'business' && !formData.organizationName.trim()) {
        setError('Company name is required for business accounts');
        setLoading(false);
        return;
      }

      // Call register endpoint
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        FullName: formData.fullName || undefined,
        Role: formData.accountType === 'business' ? 'BusinessOwner' : 'Candidate',
        OrganizationName: formData.accountType === 'business' ? formData.organizationName : undefined,
      });

      if (response.success && response.data) {
        // Store token and user info
        const { token, user } = response.data;

        // Map API response to CurrentUser format and store
        const currentUser: CurrentUser = {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          organizationId: user.organizationId,
          role: user.role || 'Candidate',
        };

        setCurrentUser(currentUser, token);

        // Role-based routing
        if (user.role === 'BusinessOwner') {
          router.push('/business');
        } else {
          router.push('/jobs');
        }
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--brand-navy)] mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Register Form Card */}
        <Card className="bg-white shadow-md">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="candidate"
                      checked={formData.accountType === 'candidate'}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="h-4 w-4 text-[var(--brand-primary)]"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Candidate (Job Seeker)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="business"
                      checked={formData.accountType === 'business'}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="h-4 w-4 text-[var(--brand-primary)]"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Business Owner (Post Jobs)
                    </span>
                  </label>
                </div>
              </div>

              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name (Optional)
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  autoComplete="off"
                  className="w-full"
                />
              </div>

              {/* Organization Name Field (Conditional) */}
              {formData.accountType === 'business' && (
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    placeholder="Your company name"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    disabled={loading}
                    required={formData.accountType === 'business'}
                    autoComplete="off"
                    className="w-full"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  autoComplete="new-email"
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Login Link */}
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
