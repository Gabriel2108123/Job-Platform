'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accountType: '1',
    businessOrProfession: '',
    location: '',
    honeypot: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incentive, setIncentive] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIncentive(null);

    // Validate honeypot
    if (formData.honeypot) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          accountType: parseInt(formData.accountType, 10),
          businessOrProfession: formData.businessOrProfession,
          location: formData.location,
          source: 'landing_page',
        }),
      });

      if (response.status === 429) {
        setError('Too many requests. Please try again later.');
        return;
      }

      if (response.status === 409) {
        setError('Email already on waitlist.');
        return;
      }

      if (response.status === 400) {
        setError('Invalid email address.');
        return;
      }

      if (!response.ok) {
        setError('An error occurred. Please try again.');
        return;
      }

      const data = await response.json();
      setIncentive(data.incentiveType === 'TwelveMonthsFree' ? 'TwelveMonthsFree' : null);
      setFormData({ name: '', email: '', accountType: '1', businessOrProfession: '', location: '', honeypot: '' });
      setSubmitted(true);

      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-[var(--gray-200)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-montserrat font-bold text-[var(--brand-navy)]">HospitalityHire</h1>
          <div className="hidden md:flex gap-8">
            <a href="#for-candidates" className="text-[var(--foreground)] hover:text-[var(--brand-navy)] transition font-poppins">
              For Employees
            </a>
            <a href="#for-businesses" className="text-[var(--foreground)] hover:text-[var(--brand-navy)] transition font-poppins">
              For Employers
            </a>
            <a href="#ambassador" className="text-[var(--foreground)] hover:text-[var(--brand-navy)] transition font-poppins">
              Ambassador
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-montserrat font-bold text-[var(--brand-navy)] mb-6">Hire Hospitality Talent, Better</h2>
        <p className="text-xl md:text-2xl text-[var(--gray-600)] max-w-3xl mx-auto mb-12 font-poppins">
          Connect directly with vetted hospitality professionals. No middlemen. Fair pay. Real careers.
        </p>
        <Button
          onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
          size="lg"
          className="text-white"
        >
          Join the Waitlist
        </Button>
      </section>

      {/* For Employees Section */}
      <section id="for-candidates" className="py-20 border-t border-[var(--gray-200)] bg-[var(--brand-off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-montserrat font-bold text-[var(--brand-navy)] text-center mb-12">For Employees</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Direct Hiring', desc: 'Apply directly to employers. No recruiters, no markups.' },
              { title: 'Fair Pricing', desc: 'See all roles with transparent pay. What you see is what you get.' },
              {
                title: 'Secure Profile',
                desc: "We don't store resumes or sensitive documents. Your data stays yours.",
              },
            ].map((card, i) => (
              <Card key={i} variant="default" className="hover:shadow-lg">
                <CardBody>
                  <h4 className="text-xl font-poppins font-semibold text-[var(--brand-navy)] mb-3">{card.title}</h4>
                  <p className="text-[var(--gray-600)] font-inter">{card.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section id="for-businesses" className="py-20 border-t border-[var(--gray-200)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-montserrat font-bold text-[var(--brand-navy)] text-center mb-12">For Employers</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Posting', desc: 'Post roles in minutes. Reach qualified hospitality professionals directly.' },
              { title: 'Smart Matching', desc: 'Candidates apply with all the info you need. No wasted time on CVs.' },
              { title: 'Predictable Costs', desc: 'Fair, transparent pricing with no hidden commission.' },
            ].map((card, i) => (
              <Card key={i} variant="default" className="hover:shadow-lg">
                <CardBody>
                  <h4 className="text-xl font-poppins font-semibold text-[var(--brand-navy)] mb-3">{card.title}</h4>
                  <p className="text-[var(--gray-600)] font-inter">{card.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ambassador Section */}
      <section id="ambassador" className="py-20 border-t border-[var(--gray-200)] bg-[var(--brand-off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-montserrat font-bold text-[var(--brand-navy)] mb-6">Ambassador Program</h3>
          <p className="text-lg text-[var(--gray-600)] mb-8 max-w-2xl mx-auto font-poppins">
            Know talented hospitality professionals? Refer them and earn rewards.
          </p>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Incentive Banner */}
      <section className="py-12 bg-[var(--brand-aqua)]/10 border-t border-[var(--brand-aqua)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-[var(--brand-navy)] font-poppins font-semibold">🎁 First 1,000 employers and 5,000 employees get 12 months free</p>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section id="waitlist-form" className="py-20 border-t border-[var(--gray-200)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-montserrat font-bold text-[var(--brand-navy)] text-center mb-8">Join the Waitlist</h3>

          {submitted && (
            <div className={`mb-6 p-4 rounded-lg text-center font-poppins font-semibold ${error ? 'bg-[var(--error)]/10 text-[var(--error)]' : 'bg-[var(--success)]/10 text-[var(--success)]'}`}>
              {error || `You're on the waitlist!${incentive === 'TwelveMonthsFree' ? ' 🎁 12 months free included.' : ''}`}
            </div>
          )}

          <Card variant="default">
            <CardBody className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="text"
                  id="name"
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  fullWidth
                />

                <Input
                  type="email"
                  id="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  fullWidth
                />

                <Select
                  id="accountType"
                  name="accountType"
                  label="I am looking to"
                  value={formData.accountType}
                  onChange={handleChange}
                  options={[
                    { value: '1', label: 'Hire talent (Business)' },
                    { value: '2', label: 'Find a job (Employee)' },
                  ]}
                  fullWidth
                />

                <Input
                  type="text"
                  id="businessOrProfession"
                  name="businessOrProfession"
                  label={formData.accountType === '1' ? 'Business Type' : 'Profession / Role'}
                  value={formData.businessOrProfession}
                  onChange={handleChange}
                  placeholder={formData.accountType === '1' ? 'e.g., Restaurant, Hotel' : 'e.g., Chef, Server, Manager'}
                  required
                  fullWidth
                />

                <Input
                  type="text"
                  id="location"
                  name="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., London, UK"
                  required
                  fullWidth
                />

                {/* Honeypot field */}
                <input type="hidden" name="honeypot" value={formData.honeypot} onChange={handleChange} />

                <Button
                  type="submit"
                  disabled={loading}
                  fullWidth
                  size="lg"
                  className="text-white"
                >
                  {loading ? 'Joining...' : 'Join the Waitlist'}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--gray-200)] py-12 bg-[var(--brand-charcoal)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[var(--gray-300)] text-sm font-poppins">© 2026 HospitalityHire. All rights reserved.</p>
            <div className="flex gap-6 mt-6 md:mt-0">
              <a href="#" className="text-[var(--gray-300)] hover:text-white transition font-poppins">
                Twitter
              </a>
              <a href="#" className="text-[var(--gray-300)] hover:text-white transition font-poppins">
                LinkedIn
              </a>
              <a href="#" className="text-[var(--gray-300)] hover:text-white transition font-poppins">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
