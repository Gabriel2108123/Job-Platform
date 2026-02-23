'use client';

import Link from 'next/link';

export default function DisputeResolution() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Dispute Resolution & Arbitration</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">1. Dispute Resolution Process</h2>
                        <p className="text-gray-700">
                            We are committed to resolving disputes fairly and efficiently. This policy outlines the procedures for
                            resolving disputes between you and <span className="text-red-600">YokeConnect</span>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Initial Resolution - Negotiation</h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>Step 1: Contact Us</strong></p>
                            <p>
                                Before pursing formal dispute resolution, please contact us at <strong>disputes@yokeconnect.com</strong> with:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Your account details</li>
                                <li>Description of the dispute</li>
                                <li>Supporting documentation</li>
                                <li>Proposed resolution</li>
                            </ul>
                            <p className="mt-3">
                                We will acknowledge receipt within 2 business days and aim to resolve the matter within 14 days.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">3. Mediation</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>
                                If negotiation fails, either party may request mediation. We agree to participate in good faith mediation
                                before pursuing arbitration or litigation.
                            </p>
                            <p><strong>Mediation Process:</strong></p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Selection of a neutral mediator by mutual agreement</li>
                                <li>Costs split equally between parties</li>
                                <li>Mediation to be completed within 30 days of request</li>
                                <li>All communications during mediation are confidential</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. Binding Arbitration</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>
                                If mediation is unsuccessful, disputes will be resolved through binding arbitration, except where prohibited by law.
                            </p>

                            <h3 className="font-semibold text-lg mt-4">4.1 Arbitration Rules</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Conducted under rules of recognized arbitration bodies (LCIA for UK/EU, AAA for USA, DIAC for UAE)</li>
                                <li>Single arbitrator unless parties agree otherwise</li>
                                <li>English language proceedings</li>
                                <li>Decision is final and binding</li>
                            </ul>

                            <h3 className="font-semibold text-lg mt-4">4.2 Arbitration Location</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>UK/EU users:</strong> London, United Kingdom</li>
                                <li><strong>USA users:</strong> New York, New York</li>
                                <li><strong>UAE users:</strong> Dubai, United Arab Emirates</li>
                                <li><strong>Other jurisdictions:</strong> London, United Kingdom (default)</li>
                            </ul>

                            <h3 className="font-semibold text-lg mt-4">4.3 Costs</h3>
                            <p>
                                Each party bears their own costs unless the arbitrator determines otherwise. For claims under £10,000/$10,000,
                                we will pay arbitration fees exceeding filing fees in small claims court.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. Class Action Waiver</h2>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-gray-700">
                                <strong>Important:</strong> You agree that disputes will be resolved on an individual basis only. You waive any right
                                to participate in a class action, class arbitration, or representative proceeding, except where prohibited by law.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">6. Exceptions to Arbitration</h2>
                        <p className="text-gray-700 mb-3">The following disputes are NOT subject to arbitration:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Intellectual property infringement claims</li>
                            <li>Claims for injunctive relief to prevent immediate harm</li>
                            <li>Small claims court proceedings (below jurisdictional limits)</li>
                            <li>Government or regulatory enforcement actions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">7. Governing Law</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>This Agreement is governed by the laws of:</p>
                            <ul className="list-disc list-inside ml-4">
                                <li><strong>UK/EU users:</strong> Laws of England and Wales</li>
                                <li><strong>USA users:</strong> Federal Arbitration Act and applicable state law</li>
                                <li><strong>UAE users:</strong> Laws of Dubai International Financial Centre (DIFC)</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">8. Severability</h2>
                        <p className="text-gray-700">
                            If any provision of this dispute resolution clause is found unenforceable, the remainder shall remain in full force and effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">9. Time Limitations</h2>
                        <p className="text-gray-700">
                            Any claim or dispute must be filed within one (1) year after the claim arises, or it will be permanently barred.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">10. Contact for Disputes</h2>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Email:</strong> disputes@yokeconnect.com</p>
                            <p><strong>Address:</strong> <span className="text-red-600">YokeConnect Ltd, London, UK</span></p>
                            <p className="mt-4 text-sm text-gray-600">
                                For regulatory complaints in the UK, you may also contact the Advertising Standards Authority (ASA) or Citizens Advice.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
