'use client';

import Link from 'next/link';

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
                            <p><strong>Registered Company Name:</strong> <span className="text-red-600">{{ COMPANY_REGISTERED_NAME }}</span></p>
                            <p><strong>Trading Name:</strong> <span className="text-red-600">{{ COMPANY_TRADING_NAME }}</span></p>
                            <p><strong>Company Number:</strong> <span className="text-red-600">{{ COMPANY_NUMBER }}</span></p>
                            <p><strong>License Number:</strong> <span className="text-red-600">{{ LICENSE_NUMBER }}</span></p>
                            <p><strong>Registered Address:</strong> <span className="text-red-600">{{ COMPANY_ADDRESS }}</span></p>
                        </div>
                    </section>

                    {/* Agreement to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Agreement to Terms</h2>
                        <p className="text-gray-700">
                            By accessing and using YokeConnect ("the Platform"), you accept and agree to be bound by the terms and provisions
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
                            <li>Remove any copyright or proprietary notations from the materials</li>
                            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                        </ul>
                    </section>

                    {/* User Accounts */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. User Accounts</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>4.1 Account Creation:</strong> Users may create accounts as either Candidates (job seekers) or Business Owners (employers).</p>
                            <p><strong>4.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                            <p><strong>4.3 Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>
                            <p><strong>4.4 Account Suspension:</strong> We reserve the right to suspend or terminate accounts that violate these Terms or for accounts with expired documentation (after notification period).</p>
                        </div>
                    </section>

                    {/* Services */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. Platform Services</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>5.1 For Candidates:</strong> Job search, profile creation, CV building, document management, location-based job discovery, and application services.</p>
                            <p><strong>5.2 For Businesses:</strong> Job posting, candidate discovery, team management, applicant tracking, and subscription-based premium features.</p>
                            <p><strong>5.3 Service Availability:</strong> While we strive to keep the Platform available 24/7, we do not guarantee uninterrupted access and may suspend services for maintenance or updates.</p>
                        </div>
                    </section>

                    {/* Subscription Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">6. Subscription and Payments</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>6.1 Subscription Plans:</strong> Business accounts may require paid subscriptions. Details are outlined in the <Link href="/legal/subscription" className="text-[var(--brand-primary)] hover:underline">Subscription Contract</Link>.</p>
                            <p><strong>6.2 Billing:</strong> Subscription fees are billed in advance on a recurring basis (monthly or annually).</p>
                            <p><strong>6.3 Refunds:</strong> Refund policies are outlined in the Subscription Contract.</p>
                            <p><strong>6.4 Cancellation:</strong> You may cancel your subscription at any time through your account settings.</p>
                        </div>
                    </section>

                    {/* Document Requirements */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">7. Document Management and Expiry</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>7.1 Document Uploads:</strong> Candidates may be required to upload identification, certifications, and other relevant documents.</p>
                            <p><strong>7.2 Expiry Notifications:</strong> The Platform will notify users 3 months before document expiry.</p>
                            <p><strong>7.3 Account Status:</strong> Accounts with expired essential documents may be subject to restrictions until documents are renewed.</p>
                            <p><strong>7.4 Document Verification:</strong> We reserve the right to verify uploaded documents and may request additional information.</p>
                        </div>
                    </section>

                    {/* User Conduct */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">8. User Conduct</h2>
                        <p className="text-gray-700 mb-3">
                            Detailed conduct guidelines are outlined in our <Link href="/legal/acceptable-use" className="text-[var(--brand-primary)] hover:underline">Acceptable Use Policy</Link>.
                            Users must not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Post false, misleading, or fraudulent job listings or profiles</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Attempt to gain unauthorized access to the Platform</li>
                        </ul>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">9. Intellectual Property</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>9.1 Platform Ownership:</strong> The Platform and its original content, features, and functionality are owned by <span className="text-red-600">{{ COMPANY_TRADING_NAME }}</span> and are protected by international copyright, trademark, and other intellectual property laws.</p>
                            <p><strong>9.2 User Content:</strong> You retain ownership of content you upload (CVs, documents, job descriptions) but grant us a license to use, display, and process this content to provide our services.</p>
                            <p><strong>9.3 YokeConnect Branding:</strong> CVs generated through our platform may include YokeConnect branding/watermark.</p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">10. Limitation of Liability</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>
                                To the fullest extent permitted by applicable law, <span className="text-red-600">{{ COMPANY_TRADING_NAME }}</span> shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Your use or inability to use the Platform</li>
                                <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                                <li>Any interruption or cessation of transmission to or from the Platform</li>
                                <li>Any bugs, viruses, trojan horses, or the like that may be transmitted through the Platform by any third party</li>
                                <li>Any employment or business relationships formed through the Platform</li>
                            </ul>
                        </div>
                    </section>

                    {/* Jurisdiction */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">11. Governing Law and Jurisdiction</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>11.1 Primary Jurisdictions:</strong> These Terms are governed by the laws of the United Kingdom, European Union, United States, and United Arab Emirates, as applicable based on your location and usage.</p>
                            <p><strong>11.2 Dispute Resolution:</strong> Any disputes arising from these Terms are subject to our <Link href="/legal/dispute" className="text-[var(--brand-primary)] hover:underline">Dispute Resolution and Arbitration procedures</Link>.</p>
                            <p><strong>11.3 International Compliance:</strong> Users are responsible for compliance with local laws in their jurisdiction.</p>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">12. Changes to Terms</h2>
                        <p className="text-gray-700">
                            We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    {/* Related Policies */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">13. Related Policies</h2>
                        <div className="space-y-2">
                            <p className="text-gray-700">Please also review our related policies:</p>
                            <ul className="list-disc list-inside space-y-2 text-[var(--brand-primary)] ml-4">
                                <li><Link href="/legal/privacy" className="hover:underline">Privacy Policy (GDPR Compliant)</Link></li>
                                <li><Link href="/legal/cookies" className="hover:underline">Cookie Policy</Link></li>
                                <li><Link href="/legal/subscription" className="hover:underline">Subscription Contract</Link></li>
                                <li><Link href="/legal/acceptable-use" className="hover:underline">Acceptable Use Policy</Link></li>
                                <li><Link href="/legal/dpa" className="hover:underline">Data Processing Agreement</Link></li>
                                <li><Link href="/legal/dispute" className="hover:underline">Dispute Resolution & Arbitration</Link></li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">14. Contact Information</h2>
                        <p className="text-gray-700">
                            If you have any questions about these Terms and Conditions, please contact us at:
                        </p>
                        <div className="mt-3 text-gray-700">
                            <p><strong>Email:</strong> legal@yokeconnect.com</p>
                            <p><strong>Address:</strong> <span className="text-red-600">{{ COMPANY_ADDRESS }}</span></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
