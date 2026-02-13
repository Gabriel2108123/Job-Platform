'use client';

import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/constants/company';

export default function SubscriptionContract() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Subscription Contract</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">1. Subscription Services</h2>
                        <p className="text-gray-700">
                            {COMPANY_INFO.TRADING_NAME} offers subscription-based services for Business Owners to post jobs,
                            access candidate profiles, and utilize premium platform features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Subscription Plans</h2>
                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="font-semibold text-lg">Starter Plan</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>Post up to 3 active jobs</li>
                                    <li>Basic candidate search</li>
                                    <li>Email support</li>
                                </ul>
                            </div>
                            <div className="border-l-4 border-purple-500 pl-4">
                                <h3 className="font-semibold text-lg">Professional Plan</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>Post unlimited jobs</li>
                                    <li>Advanced candidate filtering</li>
                                    <li>Priority support</li>
                                    <li>Analytics dashboard</li>
                                </ul>
                            </div>
                            <div className="border-l-4 border-amber-500 pl-4">
                                <h3 className="font-semibold text-lg">Enterprise Plan</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>All Professional features</li>
                                    <li>Multiple team members</li>
                                    <li>Dedicated account manager</li>
                                    <li>Custom integrations</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">3. Billing and Payment</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Subscription fees are billed in advance monthly or annually</li>
                            <li>Payments are processed securely through our payment partners</li>
                            <li>All fees are non-refundable unless otherwise stated</li>
                            <li>Prices are subject to change with 30 days' notice</li>
                            <li>Failed payments may result in service suspension</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. Cancellation and Refunds</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>4.1 Cancellation:</strong> You may cancel your subscription at any time through your account settings.</p>
                            <p><strong>4.2 Effect of Cancellation:</strong> Service continues until the end of the current billing period. No prorated refunds are provided.</p>
                            <p><strong>4.3 Refund Policy:</strong> Refunds are only provided in cases of billing errors or if we are unable to provide the Service.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. Free Trial</h2>
                        <p className="text-gray-700">
                            New subscribers may be eligible for a free trial period. You must provide payment information to start a trial.
                            If not cancelled before the trial ends, you will be automatically charged for the selected plan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">6. Service Modifications</h2>
                        <p className="text-gray-700">
                            We reserve the right to modify or discontinue features of the Service with reasonable notice. Material reductions in
                            functionality will entitle you to cancel and receive a prorated refund for the current billing period.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">7. Contact</h2>
                        <p className="text-gray-700">
                            For subscription inquiries: <strong>billing@yokeconnect.com</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
