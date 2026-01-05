import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing - Plans',
  description: 'Choose your subscription plan',
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
    </div>
  );
}
