'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { getOrganizationPermissions } from '@/lib/api/organization';
import { setCurrentUser } from '@/lib/auth-helpers';
import type { CurrentUser } from '@/lib/auth-helpers';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Clear form on mount to ensure fresh start
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
    });
    setError(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      // Call login endpoint
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data) {
        // Store token and user info
        const { token, user } = response.data;
        if (!token) throw new Error('Token missing from response');

        // Map API response to CurrentUser format and store
        const currentUser: CurrentUser = {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          organizationId: user.organizationId,
          role: user.role || 'Candidate', // Use backend role if available, default to Candidate
        };

        // Fetch permissions if business user
        if (currentUser.organizationId && ['BusinessOwner', 'Staff', 'Admin'].includes(currentUser.role as string)) {
          try {
            // Need to set token temporarily for API call to work
            localStorage.setItem('token', token as string);
            const permissions = await getOrganizationPermissions();
            currentUser.permissions = permissions;
          } catch (err) {
            console.error('Failed to fetch permissions', err);
          }
        }

        setCurrentUser(currentUser, token as string);

        // Redirect based on role
        if (currentUser.role === 'BusinessOwner') {
          router.push('/business');
        } else if (currentUser.role === 'Admin' || currentUser.role === 'Staff') {
          router.push('/admin');
        } else {
          router.push('/jobs');
        }
      } else {
        setError(response.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <Link href="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity translate-x-[-12px]">
            <BrandLogo width={120} height={40} />
          </Link>
          <p className="text-slate-500 font-medium">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form Card */}
        <Card className="bg-white border-slate-100 shadow-xl rounded-[2rem]">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
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
                  className="w-full bg-slate-50 border-slate-100 focus:bg-white transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
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
                  className="w-full bg-slate-50 border-slate-100 focus:bg-white transition-all"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6 py-6 text-lg font-black rounded-2xl shadow-lg shadow-amber-500/20"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 font-bold">
                Don't have an account?{' '}
                <Link href="/register" className="text-[var(--brand-primary)] hover:underline font-black">
                  Register here
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link href="/jobs" className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors">
            Browse jobs as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
