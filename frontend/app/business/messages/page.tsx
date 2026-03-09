import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { MessagingModule } from '@/components/messaging/MessagingModule';

export default function BusinessMessagesPage() {
    return (
        <RoleLayout pageTitle="Professional Inbox">
            <MessagingModule />
        </RoleLayout>
    );
}
