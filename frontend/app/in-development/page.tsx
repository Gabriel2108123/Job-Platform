'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export default function InDevelopmentPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card variant="default" className="max-w-md w-full text-center">
                <CardBody className="p-8">
                    <div className="text-6xl mb-6">🚧</div>
                    <h1 className="text-2xl font-bold text-[var(--brand-navy)] mb-2">
                        Coming Soon
                    </h1>
                    <p className="text-gray-500 mb-8">
                        This feature is currently under development. We're working hard to bring you the best experience!
                    </p>
                    <Link href="/dashboard">
                        <Button variant="primary" className="w-full">
                            Return to Dashboard
                        </Button>
                    </Link>
                </CardBody>
            </Card>
        </div>
    );
}
