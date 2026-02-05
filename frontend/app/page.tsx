'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { isLoggedIn } from '@/lib/auth';
import HeroSection from '@/components/landing/HeroSection';
import WaitlistForm from '@/components/landing/WaitlistForm';
import { useUserRole } from '@/lib/hooks/useUserRole';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { role, displayName, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const scrollToWaitlist = () => {
    const element = document.getElementById('waitlist-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If user is already logged in, show the personalized dashboard view instead of the landing page
  // OR keep the landing page public but show a "Go to Dashboard" banner? 
  // For this request (Landing Page Implementation), we prioritize the landing page copy.
  // But we retain the logged-in check for UX.

  return (
    <div className="min-h-screen bg-white font-poppins selection:bg-[var(--brand-primary)] selection:text-white">

      {/* Navigation Override (if needed) or just standard Layout */}

      {/* Logged In Dashboard Redirect/Banner */}
      {loggedIn && !loading && (
        <div className="bg-[var(--brand-navy)] text-white p-4 text-center animate-fade-in">
          <span className="mr-4">Welcome back, {displayName}!</span>
          <Link href={role === 'BusinessOwner' ? '/business' : role === 'Candidate' ? '/dashboard' : '/admin'} className="underline font-bold text-[var(--brand-accent)] hover:text-[var(--brand-gold)] transition-colors">
            Go to Dashboard
          </Link>
        </div>
      )}

      {/* HERO SECTION */}
      <HeroSection onScrollToForm={scrollToWaitlist} />

      {/* WAITLIST FORM SECTION - MOVED HIGHER FOR PROMINENCE */}
      <section id="waitlist-form-section" className="py-20 bg-gradient-to-br from-[var(--brand-accent)] via-[var(--brand-primary)] to-[var(--brand-navy)] relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center rounded-full bg-white/20 px-6 py-2 border border-white/30 backdrop-blur-md mb-6">
                <span className="flex h-3 w-3 rounded-full bg-[var(--brand-gold)] mr-3 animate-pulse"></span>
                <span className="text-sm md:text-base font-bold text-white tracking-wide">
                  LIMITED OFFER - LAUNCHING SOON
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Join the Waitlist<br />
                <span className="text-[var(--brand-gold)]">Get 12 Months Free</span>
              </h2>

              <p className="text-xl md:text-2xl text-white/90 mb-4">
                First <span className="font-bold text-[var(--brand-gold)]">1,000 employers</span> and <span className="font-bold text-[var(--brand-gold)]">5,000 professionals</span>
              </p>

              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Be among the first to experience commission-free hospitality recruitment. Join thousands already on our waitlist.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <WaitlistForm />
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--brand-gold)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--brand-gold)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Instant access on launch</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--brand-gold)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
          <h2 className="text-sm font-bold tracking-widest text-[var(--brand-primary)] uppercase mb-4">The Problem</h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--brand-navy)] mb-8 leading-tight">
            Hospitality hiring is fragmented, expensive, and broken.
          </h3>
          <div className="grid md:grid-cols-2 gap-12 text-left mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6 text-2xl">
                🏢
              </div>
              <h4 className="text-xl font-bold text-[var(--brand-navy)] mb-4">For Employers</h4>
              <p className="text-gray-600 leading-relaxed">
                Forced to rely on expensive recruiters, pay repeated commissions, and gamble on short-term placements with no guarantees.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-2xl">
                👨‍🍳
              </div>
              <h4 className="text-xl font-bold text-[var(--brand-navy)] mb-4">For Professionals</h4>
              <p className="text-gray-600 leading-relaxed">
                Jumping between platforms, struggling to verify real employers, and rarely getting direct access to the actual decision-makers.
              </p>
            </div>
          </div>
          <p className="text-2xl font-medium text-[var(--brand-navy)] mt-12">
            YokeConnect exists to remove friction on both sides.
          </p>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[var(--brand-primary)] uppercase mb-4">The Solution</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-[var(--brand-navy)] mb-6 leading-tight">
                Premium in execution. <br /> Challenger in mindset.
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                YokeConnect is a hospitality-only recruitment ecosystem designed to work globally.
              </p>
              <ul className="space-y-6">
                {[
                  "Employers post real jobs with real salaries.",
                  "Hospitality professionals control their profiles and data.",
                  "Both sides communicate directly, without gatekeepers.",
                  "One platform. One subscription. Unlimited connections."
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-[var(--brand-success)] rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </span>
                    <span className="text-lg text-[var(--brand-navy)] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              {/* Abstract UI Representation */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-[var(--brand-navy)] text-white p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                    <div>
                      <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                      <div className="h-2 w-16 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[var(--brand-success)] text-xs font-bold rounded-full">CONNECTED</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg border-l-4 border-[var(--brand-accent)]">
                    <p className="text-sm text-gray-300">"Looking for a Head Chef. Salary £45k+"</p>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[var(--brand-primary)] p-4 rounded-lg max-w-xs">
                      <p className="text-sm">"I have 10 years experience and I'm verified. Let's talk."</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-sm text-[var(--brand-gold)] font-mono uppercase tracking-widest">Direct Connection Established</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION (Grid) */}
      <section className="py-24 bg-[var(--brand-navy)] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why YokeConnect?</h2>
            <p className="text-xl text-gray-400">Built for the industry, by the industry.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/10 hover:scale-105 hover:shadow-xl">
              <h3 className="text-xl font-bold text-[var(--brand-accent)] mb-3">No Commissions</h3>
              <p className="text-gray-400">Hire without recruiters or percentage fees. Keep your budget for salaries.</p>
            </div>
            {/* Benefit 2 */}
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/10 hover:scale-105 hover:shadow-xl">
              <h3 className="text-xl font-bold text-[var(--brand-accent)] mb-3">Unlimited Jobs</h3>
              <p className="text-gray-400">Post as many roles as you need under a single, simple subscription.</p>
            </div>
            {/* Benefit 3 */}
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/10 hover:scale-105 hover:shadow-xl">
              <h3 className="text-xl font-bold text-[var(--brand-accent)] mb-3">Direct Comms</h3>
              <p className="text-gray-400">Message candidates directly. No middlemen slowing down your process.</p>
            </div>
            {/* Benefit 4 */}
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/10 hover:scale-105 hover:shadow-xl">
              <h3 className="text-xl font-bold text-[var(--brand-accent)] mb-3">Verified Talent</h3>
              <p className="text-gray-400">Access verified hospitality professionals with transparency enforced.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--brand-navy)] border-t border-white/10 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-8 mb-8">
            <span className="text-2xl font-bold text-white">YokeConnect</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} YokeConnect. All rights reserved. <br />
            Hospitality hiring that actually moves.
          </p>
        </div>
      </footer>
    </div>
  );
}
