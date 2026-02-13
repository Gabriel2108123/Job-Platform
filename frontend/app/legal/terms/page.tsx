'use client';

import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/constants/company';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Terms and Conditions</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    {/* Company Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">1. Company Information</h2>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Registered Company Name:</strong> {COMPANY_INFO.REGISTERED_NAME}</p>
                            <p><strong>Trading Name:</strong> {COMPANY_INFO.TRADING_NAME}</p>
                            <p><strong>Company Number:</strong> {COMPANY_INFO.COMPANY_NUMBER}</p>
                            <p><strong>License Number:</strong> {COMPANY_INFO.LICENSE_NUMBER}</p>
                            <p><strong>Registered Address:</strong> {COMPANY_INFO.ADDRESS}</p>
                        </div>
                    </section>

                    {/* Agreement to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Agreement to Terms</h2>
                        <p className="text-gray-700">
                            By accessing and using {COMPANY_INFO.TRADING_NAME} (&quot;the Platform&quot;), you accept and agree to be bound by the terms and provisions
                            of this agreement. If you do not agree to abide by these Terms and Conditions, please do not use this Platform.
                        </p>
                    </section>

                    {/* Use License */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">3. Use License</h2>
                        <p className="text-gray-700 mb-3">
                            Permission is granted to temporarily access the Platform for personal, non-commercial use only. This is the grant
                            of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose or public display</li>
                            <li>Attempt to decompile or reverse engineer any software contained on the Platform</li>
                            <li>Remove any copyright or other proprietary notations from the materials</li>
                            <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
                        </ul>
                    </section>

                    {/* User Accounts */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. User Accounts</h2>
                        <p className="text-gray-700 mb-3">
                            When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                            You are responsible for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Safeguarding your password</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized use of your account</li>
                        </ul>
                    </section>

                    {/* Platform Services */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. Platform Services</h2>
                        <p className="text-gray-700 mb-3">
                            {COMPANY_INFO.TRADING_NAME} provides a platform connecting hospitality professionals with employers. We:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Do not guarantee employment or job placement</li>
                            <li>Are not responsible for the conduct of users on the platform</li>
                            <li>Reserve the right to remove any content or user at our discretion</li>
                            <li>May introduce or modify features without prior notice</li>
                        </ul>
                    </section>

                    {/* Subscription and Payments */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">6. Subscription and Payments</h2>
                        <p className="text-gray-700 mb-3">
                            For paid subscription services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Subscription fees are billed in advance on a recurring basis</li>
                            <li>All fees are non-refundable unless otherwise stated</li>
                            <li>We reserve the right to change pricing with 30 days notice</li>
                            <li>Failure to pay may result in suspension of access</li>
                        </ul>
                    </section>

                    {/* Disclaimer */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">7. Disclaimer</h2>
                        <p className="text-gray-700">
                            The Platform and all materials on it are provided &quot;as is&quot;. {COMPANY_INFO.REGISTERED_NAME} makes no warranties,
                            expressed or implied, and hereby disclaims all other warranties. We do not warrant that the Platform will be
                            uninterrupted, secure, or error-free.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">8. Limitation of Liability</h2>
                        <p className="text-gray-700">
                            In no event shall {COMPANY_INFO.REGISTERED_NAME}, its directors, employees, or affiliates be liable for any
                            indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">9. Governing Law</h2>
                        <p className="text-gray-700">
                            These Terms shall be governed by and construed in accordance with {COMPANY_INFO.GOVERNING_LAW},
                            without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive
                            jurisdiction of the courts of {COMPANY_INFO.JURISDICTION}.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">10. Changes to Terms</h2>
                        <p className="text-gray-700">
                            We reserve the right to modify these Terms at any time. We will notify users of any material changes
                            by posting the new Terms on this page along with the updated effective date.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">11. Contact Us</h2>
                        <p className="text-gray-700">
                            For questions about these Terms, please contact us at:
                        </p>
                        <div className="mt-2 text-gray-700">
                            <p><strong>Email:</strong> {COMPANY_INFO.EMAIL}</p>
                            <p><strong>Address:</strong> {COMPANY_INFO.ADDRESS}</p>
                        </div>
                    </section>
                </div>

                {/* Related Links */}
                <div className="mt-8 flex gap-4 text-sm">
                    <Link href="/legal/privacy" className="text-[var(--brand-primary)] hover:underline">
                        Privacy Policy
                    </Link>
                    <Link href="/legal/cookies" className="text-[var(--brand-primary)] hover:underline">
                        Cookie Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}
