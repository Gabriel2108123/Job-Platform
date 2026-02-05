'use client';

import Link from 'next/link';

export default function AcceptableUse() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Acceptable Use Policy</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">1. Purpose</h2>
                        <p className="text-gray-700">
                            This Acceptable Use Policy outlines prohibited uses of YokeConnect. Violation of this policy may result in
                            account suspension or termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Prohibited Activities</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.1 Illegal Activities</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Violating any local, national, or international law</li>
                                    <li>Posting jobs for illegal activities</li>
                                    <li>Human trafficking or exploitation</li>
                                    <li>Money laundering or fraud</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.2 Fraudulent Content</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Posting fake job listings</li>
                                    <li>Creating false profiles or impersonating others</li>
                                    <li>Misrepresenting qualifications or experience</li>
                                    <li>Providing false or misleading company information</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.3 Harassment and Abuse</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Harassing, threatening, or abusing other users</li>
                                    <li>Discriminatory practices based on race, gender, religion, nationality, etc.</li>
                                    <li>Sexual harassment or unwanted advances</li>
                                    <li>Bullying or intimidation</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.4 Spam and Misuse</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Sending unsolicited messages or spam</li>
                                    <li>Posting duplicate job listings</li>
                                    <li>Using automated tools to scrape data</li>
                                    <li>Creating multiple accounts to circumvent restrictions</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.5 Security Violations</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Attempting to gain unauthorized access to systems</li>
                                    <li>Distributing viruses or malware</li>
                                    <li>Interfering with platform functionality</li>
                                    <li>Bypassing security measures</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.6 Intellectual Property Infringement</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Copyright infringement</li>
                                    <li>Trademark violations</li>
                                    <li>Unauthorized use of proprietary information</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">3. Consequences of Violation</h2>
                        <p className="text-gray-700 mb-3">Violations may result in:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Warning and content removal</li>
                            <li>Temporary account suspension</li>
                            <li>Permanent account termination</li>
                            <li>Legal action if applicable</li>
                            <li>Reporting to law enforcement</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. Reporting Violations</h2>
                        <p className="text-gray-700">
                            If you encounter content or behavior that violates this policy, please report it to: <strong>abuse@yokeconnect.com</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. Enforcement</h2>
                        <p className="text-gray-700">
                            We reserve the right to investigate suspected violations and take appropriate action. We may cooperate with
                            law enforcement in investigations of illegal activity.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
