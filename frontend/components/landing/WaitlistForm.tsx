'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';

export default function WaitlistForm() {
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
      // Silently "succeed" for bots
      setSubmitted(true);
      return;
    }

    setLoading(true);

    try {
      // Import apiRequest dynamically or assume it's imported at the top. 
      // Better to add import at top and use it here.
      // Since I am replacing the whole block, I need to make sure I add the import first.
      // But I can't add imports with replace_file_content easily if I only replace this block.
      // Use multi_replace to add import AND replace submit logic.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5205'}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          accountType: parseInt(formData.accountType, 10),
          businessOrProfession: formData.businessOrProfession,
          location: formData.location,
          source: 'landing_page_v2',
        }),
      });

      if (response.status === 429) {
        setError('Too many requests. Please try again later.');
        return;
      }

      if (response.status === 409) {
        setError('Masks off! Use a real email address, please.'); // "Masks off" playful tone
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }

      setIncentive(data.incentive === 'TwelveMonthsFree' ? 'TwelveMonthsFree' : null);
      setFormData({ name: '', email: '', accountType: '1', businessOrProfession: '', location: '', honeypot: '' });
      setSubmitted(true);

    } catch {
      setError('Network connection failed. Are you online?');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && !error) {
    return (
      <Card variant="default" className="bg-white/95 backdrop-blur-sm border-2 border-[var(--brand-primary)] animate-fade-in">
        <CardBody className="text-center py-12 px-6">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-[var(--success)]/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--brand-navy)] mb-4">You're on the list.</h3>
          <p className="text-lg text-[var(--gray-600)] mb-6">
            We'll be in touch soon throughout the launch.
          </p>
          {incentive === 'TwelveMonthsFree' && (
            <div className="inline-block bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)] rounded-lg p-4 max-w-sm mx-auto">
              <p className="font-bold text-[var(--brand-navy)]">Level Up Unlocked</p>
              <p className="text-sm text-[var(--brand-charcoal)]">
                You secured <strong>12 Months Free</strong> access as an early adopter.
              </p>
            </div>
          )}
          <Button
            className="mt-8"
            variant="outline"
            onClick={() => setSubmitted(false)}
          >
            Register another person
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="default" className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardBody className="p-8">
        <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-2 text-center">
          Secure your spot
        </h3>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Join the revolution in hospitality hiring.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-[var(--error)] text-sm rounded-lg border border-red-100 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              type="text"
              id="name"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Chester Copperpot"
              required
              fullWidth
              className="bg-gray-50"
            />
            <Input
              type="email"
              id="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="chester@example.com"
              required
              fullWidth
              className="bg-gray-50"
            />
          </div>

          <Select
            id="accountType"
            name="accountType"
            label="I am a..."
            value={formData.accountType}
            onChange={handleChange}
            options={[
              { value: '1', label: 'Hospitality Employer (looking to hire)' },
              { value: '2', label: 'Hospitality Professional (looking for work)' },
            ]}
            fullWidth
            className="bg-gray-50"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              type="text"
              id="businessOrProfession"
              name="businessOrProfession"
              label={formData.accountType === '1' ? 'Business Name' : 'Current Role'}
              value={formData.businessOrProfession}
              onChange={handleChange}
              placeholder={formData.accountType === '1' ? 'The Grand Hotel' : 'Head Chef'}
              required
              fullWidth
              className="bg-gray-50"
            />

            <Input
              type="text"
              id="location"
              name="location"
              label="City / Region"
              value={formData.location}
              onChange={handleChange}
              placeholder="Manchester, UK"
              required
              fullWidth
              className="bg-gray-50"
            />
          </div>

          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
            tabIndex={-1}
            autoComplete="off"
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            className="mt-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-navy)] text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {loading ? 'Securing Spot...' : 'Join Waitlist'}
          </Button>

          <p className="text-xs text-center text-gray-400 mt-4">
            Limited spots available for the 12-month free offer.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
