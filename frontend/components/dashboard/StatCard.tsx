'use client';

import { Card, CardBody } from '@/components/ui/Card';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
    trend?: string;
    color?: string;
}

export function StatCard({ label, value, icon, trend, color = 'var(--brand-primary)' }: StatCardProps) {
    return (
        <Card variant="default" className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}15`, color }}>
                        {icon}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
