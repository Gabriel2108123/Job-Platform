'use client';

import Link from 'next/link';

export default function DataProcessingAgreement() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Data Processing Agreement (DPA)</h1>
                    <p className="text-gray-600">GDPR Article 28 | Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">1. Definitions</h2>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Data Controller:</strong> Business Owner/Employer using YokeConnect services</p>
                            <p><strong>Data Processor:</strong> <span className="text-red-600">YokeConnect</span></p>
                            <p><strong>Personal Data:</strong> Candidate information processed through the Platform</p>
                            <p><strong>Processing:</strong> Any operation performed on Personal Data</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Scope and Purpose</h2>
                        <p className="text-gray-700">
                            This Data Processing Agreement applies when Business Owners (Data Controllers) use YokeConnect to process
                            candidate personal data. We act as a Data Processor on your behalf for recruitment purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">3. Data Processor Obligations</h2>
                        <p className="text-gray-700 mb-3">We (as Data Processor) will:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Process Personal Data only on documented instructions from the Controller</li>
                            <li>Ensure persons authorized to process data are under confidentiality obligations</li>
                            <li>Implement appropriate technical and organizational security measures (GDPR Article 32)</li>
                            <li>Only engage sub-processors with prior authorization and under written contract</li>
                            <li>Assist the Controller in responding to data subject rights requests</li>
                            <li>Assist the Controller in ensuring compliance with GDPR Articles 32-36</li>
                            <li>Delete or return Personal Data upon termination of services</li>
                            <li>Make available information necessary to demonstrate compliance</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. Data Controller Obligations</h2>
                        <p className="text-gray-700 mb-3">You (as Data Controller) must:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Ensure you have legal basis to process candidate data</li>
                            <li>Provide clear privacy notices to candidates</li>
                            <li>Obtain necessary consents where required</li>
                            <li>Respond to data subject access requests</li>
                            <li>Maintain records of processing activities</li>
                            <li>Report data breaches to supervisory authorities as required</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. Sub-Processors</h2>
                        <p className="text-gray-700 mb-3">
                            We may engage the following categories of sub-processors to assist in providing services:
                        </p>
                        <ul className="list-disc list-inside space-y- 2 text-gray-700 ml-4">
                            <li><strong>Cloud Hosting:</strong> AWS, Microsoft Azure (data storage and compute)</li>
                            <li><strong>Payment Processing:</strong> Stripe, PayPal</li>
                            <li><strong>Email Services:</strong> SendGrid, AWS SES</li>
                            <li><strong>Analytics:</strong> Google Analytics (anonymized)</li>
                            <li><strong>AI Services:</strong> OpenAI, Anthropic (for CV assistance)</li>
                        </ul>
                        <p className="text-gray-700 mt-3">
                            We maintain a current list of sub-processors and will notify you of changes with 30 days' notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">6. Security Measures</h2>
                        <p className="text-gray-700 mb-3">Technical and organizational measures include:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Encryption of data in transit (TLS 1.3) and at rest (AES-256)</li>
                            <li>Access controls and authentication (MFA available)</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Employee training on data protection</li>
                            <li>Incident response procedures</li>
                            <li>Regular backups and disaster recovery plans</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">7. Data Breach Notification</h2>
                        <p className="text-gray-700">
                            In the event of a personal data breach, we will notify you without undue delay and within 72 hours of becoming
                            aware, providing all relevant information to enable you to meet your own notification obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">8. International Data Transfers</h2>
                        <p className="text-gray-700">
                            Where data is transferred outside the UK/EU, we ensure adequate safeguards through Standard Contractual Clauses
                            (SCCs) approved by the European Commission and UK authorities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">9. Audit Rights</h2>
                        <p className="text-gray-700">
                            You have the right to audit our compliance with this DPA. We will provide reasonable cooperation and may provide
                            third-party audit reports (e.g., SOC 2, ISO 27001) to fulfill this requirement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">10. Term and Termination</h2>
                        <p className="text-gray-700">
                            This DPA remains in effect for the duration of our service agreement. Upon termination, we will delete or return
                            all Personal Data within 30 days, unless legally required to retain it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">11. Contact</h2>
                        <p className="text-gray-700">
                            For DPA inquiries: <strong>dpo@yokeconnect.com</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
