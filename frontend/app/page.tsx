'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { isLoggedIn, getUser } from '@/lib/auth';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { role, displayName, loading } = useUserRole();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--brand-navy)] via-[var(--brand-primary)] to-[var(--brand-accent)] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              YokeConnect
            </h1>
            <p className="text-2xl md:text-3xl mb-4 font-light">
              Hospitality hiring that actually moves.
            </p>
            <p className="text-xl mb-8 text-white/90">
              Connect talent with opportunity. Faster hiring, safer process, clear value for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button variant="primary" size="lg" className="bg-white text-[var(--brand-primary)] hover:bg-gray-100 w-full sm:w-auto">
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/waitlist">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  Join Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Section for Logged-In Users */}
      {loggedIn && !loading && role && (
        <section className="py-8 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card variant="default">
              <CardBody>
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-2">
                      Welcome back, {displayName}!
                    </h2>
                    <p className="text-gray-600">
                      {role === 'Candidate' && '🎯 Continue building your career and finding great opportunities'}
                      {role === 'BusinessOwner' && '📊 Manage your hiring pipeline and team'}
                      {role === 'Staff' && '📋 Review and manage job applications'}
                      {role === 'Support' && '🆘 Help our users and resolve their issues'}
                      {role === 'Admin' && '⚙️ Manage the platform and users'}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    {role === 'Candidate' && (
                      <Link href="/applications">
                        <Button variant="primary">View Applications →</Button>
                      </Link>
                    )}
                    {(role === 'BusinessOwner' || role === 'Staff') && (
                      <Link href="/business/pipeline">
                        <Button variant="primary">View Pipeline →</Button>
                      </Link>
                    )}
                    {role === 'Support' && (
                      <Link href="/support/tickets">
                        <Button variant="primary">View Support Tickets →</Button>
                      </Link>
                    )}
                    {role === 'Admin' && (
                      <Link href="/admin">
                        <Button variant="primary">Open Admin Dashboard →</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--brand-navy)] mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to connect employers with the right candidates
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--brand-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-3">
                1. Post or Apply
              </h3>
              <p className="text-gray-600">
                Employers post jobs with detailed requirements. Candidates browse and apply with verified profiles.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--brand-accent)]/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[var(--brand-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-3">
                2. Move Through Pipeline
              </h3>
              <p className="text-gray-600">
                Track candidates through screening, interviews, and pre-hire checks in one clear pipeline.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-3">
                3. Message & Share Docs
              </h3>
              <p className="text-gray-600">
                Communicate securely and share documents safely. No passport storage, just verified sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--brand-navy)] mb-4">
              Built on trust and safety
            </h2>
            <p className="text-xl text-gray-600">
              We take compliance and security seriously
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-2">
                Email Verification
              </h3>
              <p className="text-gray-600">
                All users verify their email before taking action. Real people only.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-2">
                No Passport Storage
              </h3>
              <p className="text-gray-600">
                We don't store sensitive documents. Secure sharing only when needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-2">
                Pre-Hire Confirmation
              </h3>
              <p className="text-gray-600">
                Mandatory pre-hire checks before anyone is marked as hired. Compliance built-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-20 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your hiring?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join the waitlist and be among the first to experience YokeConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/waitlist">
              <Button variant="primary" size="lg" className="bg-white text-[var(--brand-primary)] hover:bg-gray-100 w-full sm:w-auto">
                Join Waitlist Now
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Browse Jobs First
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
