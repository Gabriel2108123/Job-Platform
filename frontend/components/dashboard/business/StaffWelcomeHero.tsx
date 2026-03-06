'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function StaffWelcomeHero() {
    return (
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
            <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">Focus on finding<br />the right talent.</h2>
                <p className="text-indigo-100 text-lg mb-10 max-w-md">
                    You have 12 new applicants to review today across your active roles.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href={ROUTES.BUSINESS.CANDIDATES}>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black text-xs uppercase tracking-widest px-8 py-6 h-auto border-none">
                            Review Applicants
                        </Button>
                    </Link>
                    <Link href={ROUTES.BUSINESS.CANDIDATES}>
                        <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest px-8 py-6 h-auto">
                            <Search className="w-4 h-4 mr-2" /> Search Talent
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Visual flair */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl translate-y-1/2" />
        </div>
    );
}
