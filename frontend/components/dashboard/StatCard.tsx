'use client';

import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: string; // Icon is now optional/removed
    trend?: string;
    color?: string;
    href?: string;
    onClick?: () => void;
}

export function StatCard({ label, value, icon, trend, color = 'var(--brand-primary)', href, onClick }: StatCardProps) {
    const CardContent = (
        <Card
            variant="default"
            className={`transition-all duration-300 transform hover:-translate-y-1 ${href || onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
            onClick={onClick}
        >
            <CardBody className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                        <h3 className="text-3xl font-bold" style={{ color }}>{value}</h3>
                        {trend && (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                                {trend}
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}15`, color }}>
                            {icon}
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );

    if (href) {
        return <Link href={href}>{CardContent}</Link>;
    }

    return CardContent;
}
