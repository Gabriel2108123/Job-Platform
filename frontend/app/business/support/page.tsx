'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { ContactSupportForm } from '@/components/support/ContactSupportForm';

export default function BusinessSupportPage() {
    return (
        <RoleLayout pageTitle="Support">
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Business Support</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Having trouble with your job posts or billing? Send us a message and our dedicated business support team will assist you.
                    </p>
                </div>

                <ContactSupportForm />
            </div>
        </RoleLayout>
    );
}
