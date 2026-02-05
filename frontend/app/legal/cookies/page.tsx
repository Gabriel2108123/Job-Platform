'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CookiePolicy() {
    const [cookiePreferences, setCookiePreferences] = useState({
        essential: true, // Always required
        analytics: false,
        marketing: false,
    });

    const handleSavePreferences = () => {
        // Save to localStorage
        localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
        alert('Your cookie preferences have been saved');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Cookie Policy</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    {/* What Are Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">1. What Are Cookies?</h2>
                        <p className="text-gray-700">
                            Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience
                            by remembering your preferences, keeping you logged in, and analyzing how you use our Platform.
                        </p>
                    </section>

                    {/* Types of Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">2. Types of Cookies We Use</h2>

                        <div className="space-y-4">
                            <div className="border-l-4 border-green-500 pl-4">
                                <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2">Essential Cookies (Required)</h3>
                                <p className="text-gray-700 mb-2">
                                    These cookies are necessary for the Platform to function and cannot be disabled.
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 text-sm">
                                    <li>Authentication and session management</li>
                                    <li>Security and fraud prevention</li>
                                    <li>Load balancing and performance</li>
                                    <li>User preferences (language, region)</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2">Analytics Cookies (Optional)</h3>
                                <p className="text-gray-700 mb-2">
                                    These help us understand how visitors use our Platform so we can improve it.
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 text-sm">
                                    <li>Google Analytics</li>
                                    <li>Page view tracking</li>
                                    <li>User behavior analysis</li>
                                    <li>Performance monitoring</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2">Marketing Cookies (Optional)</h3>
                                <p className="text-gray-700 mb-2">
                                    These are used to deliver relevant advertisements and track campaign effectiveness.
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 text-sm">
                                    <li>Targeted advertising</li>
                                    <li>Social media integration</li>
                                    <li>Email campaign tracking</li>
                                    <li>Retargeting pixels</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Cookie Preferences */}
                    <section className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">3. Manage Your Cookie Preferences</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                                    <p className="text-sm text-gray-600">Required for the Platform to function</p>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="h-5 w-5 text-green-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-500">Always Active</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                                    <p className="text-sm text-gray-600">Help us improve the Platform</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cookiePreferences.analytics}
                                        onChange={(e) => setCookiePreferences({ ...cookiePreferences, analytics: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                                    <p className="text-sm text-gray-600">Used for advertising and remarketing</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cookiePreferences.marketing}
                                        onChange={(e) => setCookiePreferences({ ...cookiePreferences, marketing: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <button
                                onClick={handleSavePreferences}
                                className="w-full bg-[var(--brand-primary)] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-semibold mt-4"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </section>

                    {/* Third-Party Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">4. Third-Party Cookies</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>We use services from trusted third parties that may set their own cookies:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Google Analytics:</strong> Website usage analytics</li>
                                <li><strong>Stripe:</strong> Payment processing</li>
                                <li><strong>Social Media Platforms:</strong> Social login and sharing features</li>
                                <li><strong>Content Delivery Networks (CDNs):</strong> Fast content delivery</li>
                            </ul>
                            <p className="mt-3">
                                These third parties have their own privacy policies governing the use of cookies.
                            </p>
                        </div>
                    </section>

                    {/* Control Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">5. How to Control Cookies</h2>
                        <div className="space-y-3 text-gray-700">
                            <p>You can control and manage cookies in several ways:</p>

                            <h4 className="font-semibold mt-4">Browser Settings:</h4>
                            <p>Most browsers allow you to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>View what cookies are stored and delete them individually</li>
                                <li>Block third-party cookies</li>
                                <li>Block cookies from specific websites</li>
                                <li>Block all cookies</li>
                                <li>Delete all cookies when you close your browser</li>
                            </ul>

                            <h4 className="font-semibold mt-4">Browser-Specific Instructions:</h4>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                            </ul>

                            <p className="mt-4 text-amber-700 bg-amber-50 p-3 rounded">
                                ⚠️ <strong>Note:</strong> Disabling essential cookies may affect the functionality of our Platform.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">6. Questions About Cookies</h2>
                        <p className="text-gray-700">
                            If you have questions about our use of cookies, please contact us at:
                        </p>
                        <div className="mt-3 text-gray-700">
                            <p><strong>Email:</strong> privacy@yokeconnect.com</p>
                            <p><strong>Address:</strong> <span className="text-red-600">{{ COMPANY_ADDRESS }}</span></p>
                        </div>
                        <p className="mt-4 text-gray-700">
                            For more information about privacy, see our <Link href="/legal/privacy" className="text-[var(--brand-primary)] hover:underline">Privacy Policy</Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
