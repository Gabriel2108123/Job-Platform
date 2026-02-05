'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Privacy Policy</h1>
                    <p className="text-gray-600">GDPR Compliant | Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">1. Introduction</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>
                                <span className="text-red-600">{{ COMPANY_TRADING_NAME }}</span> ("we," "our," or "us") is committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
                            </p>
                            <p>
                                This policy complies with the General Data Protection Regulation (GDPR), UK Data Protection Act 2018, and other applicable
                                data protection laws in the UK, EU, USA, and UAE.
                            </p>
                        </div>
                    </section>

                    {/* Data Controller */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Data Controller</h2>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Company Name:</strong> <span className="text-red-600">{{ COMPANY_REGISTERED_NAME }}</span></p>
                            <p><strong>Trading As:</strong> <span className="text-red-600">{{ COMPANY_TRADING_NAME }}</span></p>
                            <p><strong>Company Number:</strong> <span className="text-red-600">{{ COMPANY_NUMBER }}</span></p>
                            <p><strong>Address:</strong> <span className="text-red-600">{{ COMPANY_ADDRESS }}</span></p>
                            <p><strong>Data Protection Email:</strong> privacy@yokeconnect.com</p>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">3. Information We Collect</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2">3.1 Personal Information</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Name, email address, phone number</li>
                                    <li>Profile information (photo, bio, work preferences)</li>
                                    <li>CV/Resume data (work history, education, skills, certifications)</li>
                                    <li>Location data (for job matching and map features)</li>
                                    <li>Identity documents (passport, ID, certificates - for verification)</li>
                                    <li>Payment information (for business subscriptions)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2">3.2 Technical Data</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>IP address, browser type, device information</li>
                                    <li>Usage data, page views, click patterns</li>
                                    <li>Cookies and similar tracking technologies (see our <Link href="/legal/cookies" className="text-[var(--brand-primary)] hover:underline">Cookie Policy</Link>)</li>
                                    <li>Log files and analytics data</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2">3.3 Communications</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Messages between candidates and employers</li>
                                    <li>Support inquiries and correspondence</li>
                                    <li>Email communications and notification preferences</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. How We Use Your Information</h2>

                        <div className="space-y-3 text-gray-700">
                            <p><strong>Legal Basis (GDPR):</strong></p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Contract Performance:</strong> To provide our recruitment and job matching services</li>
                                <li><strong>Legitimate Interests:</strong> To improve our Platform, prevent fraud, and ensure security</li>
                                <li><strong>Consent:</strong> For marketing communications and optional features</li>
                                <li><strong>Legal Obligation:</strong> To comply with legal requirements</li>
                            </ul>

                            <p className="mt-4"><strong>Specific Uses:</strong></p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Matching candidates with relevant job opportunities</li>
                                <li>Displaying candidate profiles to potential employers (with privacy controls)</li>
                                <li>Facilitating communication between users</li>
                                <li>Processing payments for subscriptions</li>
                                <li>Sending job alerts and platform notifications</li>
                                <li>Document expiry reminders and account status updates</li>
                                <li>Platform analytics and improvements</li>
                                <li>Customer support and issue resolution</li>
                                <li>Legal compliance and fraud prevention</li>
                            </ul>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. Information Sharing and Disclosure</h2>

                        <div className="space-y-3 text-gray-700">
                            <p><strong>5.1 With Employers:</strong> Candidate profiles, CVs, and application materials are shared with employers when candidates apply for jobs or are discovered through our Platform.</p>

                            <p><strong>5.2 Service Providers:</strong> We share data with trusted third parties who assist us:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Cloud hosting providers (AWS, Azure, etc.)</li>
                                <li>Payment processors (Stripe, PayPal)</li>
                                <li>Email service providers</li>
                                <li>Analytics services</li>
                                <li>Customer support tools</li>
                                <li>AI services (for CV building assistance)</li>
                            </ul>

                            <p><strong>5.3 Legal Requirements:</strong> We may disclose your information if required by law, court order, or to protect our rights and safety.</p>

                            <p><strong>5.4 Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>

                            <p><strong>5.5 We Do Not Sell Your Data:</strong> We never sell your personal information to third parties for marketing purposes.</p>
                        </div>
                    </section>

                    {/* International Data Transfers */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">6. International Data Transfers</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>
                                As we operate globally (UK, EU, USA, UAE), your data may be transferred to and processed in countries outside your country of residence.
                            </p>
                            <p>
                                For transfers outside the UK/EU, we ensure adequate protection through:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                                <li>Adequacy decisions where applicable</li>
                                <li>Data Processing Agreements with all processors (see <Link href="/legal/dpa" className="text-[var(--brand-primary)] hover:underline">DPA</Link>)</li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">7. Data Retention</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>We retain your personal data only for as long as necessary:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                                <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days; some data retained for legal/compliance purposes for up to 7 years</li>
                                <li><strong>CVs and Documents:</strong> Retained until you delete them or close your account</li>
                                <li><strong>Job Applications:</strong> Retained for 2 years after application date</li>
                                <li><strong>Communications:</strong> Retained for 1 year unless required for legal purposes</li>
                            </ul>
                        </div>
                    </section>

                    {/* Your Rights (GDPR) */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">8. Your Rights Under GDPR</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>You have the following rights regarding your personal data:</p>

                            <ul className="space-y-2 ml-4">
                                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
                                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
                                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local supervisory authority (ICO in the UK)</li>
                            </ul>

                            <p className="mt-4">
                                To exercise any of these rights, contact us at: <strong>privacy@yokeconnect.com</strong>
                            </p>
                            <p>
                                We will respond within 30 days of your request.
                            </p>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">9. Data Security</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>We implement appropriate technical and organizational measures to protect your data:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Encryption in transit (HTTPS/TLS) and at rest</li>
                                <li>Secure authentication and access controls</li>
                                <li>Regular security audits and vulnerability assessments</li>
                                <li>Employee training on data protection</li>
                                <li>Incident response procedures</li>
                            </ul>
                            <p className="mt-3">
                                However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                            </p>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">10. Children's Privacy</h2>
                        <p className="text-gray-700">
                            Our Platform is not intended for individuals under 16 years of age (18 in some jurisdictions). We do not knowingly collect
                            personal information from children. If we become aware that a child has provided us with personal data, we will delete it promptly.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">11. Cookies and Tracking</h2>
                        <p className="text-gray-700">
                            We use cookies and similar technologies to enhance your experience. For detailed information, please see our <Link href="/legal/cookies" className="text-[var(--brand-primary)] hover:underline">Cookie Policy</Link>.
                        </p>
                    </section>

                    {/* Changes to Privacy Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">12. Changes to This Privacy Policy</h2>
                        <p className="text-gray-700">
                            We may update this Privacy Policy from time to time. We will notify you of material changes via email or platform notification.
                            The "Last Updated" date at the top indicates when this policy was last revised.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">13. Contact Us</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>If you have questions about this Privacy Policy or how we handle your data:</p>
                            <p><strong>Email:</strong> privacy@yokeconnect.com</p>
                            <p><strong>Data Protection Officer:</strong> dpo@yokeconnect.com</p>
                            <p><strong>Address:</strong> <span className="text-red-600">{{ COMPANY_ADDRESS }}</span></p>
                        </div>
                    </section>

                    {/* Supervisory Authorities */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">14. Supervisory Authorities</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>You have the right to lodge a complaint with the relevant data protection authority:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li><strong>UK:</strong> Information Commissioner's Office (ICO) - ico.org.uk</li>
                                <li><strong>EU:</strong> Your local Data Protection Authority</li>
                                <li><strong>USA:</strong> Federal Trade Commission (FTC)</li>
                                <li><strong>UAE:</strong> UAE Data Office</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
