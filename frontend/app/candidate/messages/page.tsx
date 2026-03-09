import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { MessagingModule } from '@/components/messaging/MessagingModule';

export default function CandidateMessagesPage() {
    return (
        <RoleLayout pageTitle="Messaging">
            <MessagingModule />
        </RoleLayout>
    );
}
