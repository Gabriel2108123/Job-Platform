import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { MessagingModule } from '@/components/messaging/MessagingModule';

export default function RootMessagesPage() {
  return (
    <RoleLayout pageTitle="Professional Messaging">
      <MessagingModule />
    </RoleLayout>
  );
}
