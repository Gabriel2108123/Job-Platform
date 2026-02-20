'use client';

import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function RegisterVerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card className="shadow-2xl border-none overflow-hidden">
                    <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-navy)] h-2"></div>
                    <CardBody className="p-10 text-center">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">
                            📧
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--brand-navy)] mb-4">
                            Check your email
                        </h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            We've sent a verification link to your email address. Please click the link to activate your account and access the platform.
                        </p>

                        <div className="space-y-4">
                            <Link href="/login">
                                <Button variant="primary" className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 py-4 h-auto text-lg font-bold">
                                    Go to Login
                                </Button>
                            </Link>
                            <p className="text-sm text-gray-500">
                                Didn't receive the email? Check your spam folder or
                                <button className="text-[var(--brand-primary)] font-bold ml-1 hover:underline">Resend email</button>
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
