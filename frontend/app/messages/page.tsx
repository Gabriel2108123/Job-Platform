'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireVerifiedEmail } from '@/components/auth/RequireVerifiedEmail';
import { apiRequest } from '@/lib/api/client';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: string;
  isRead: boolean;
}

export default function MessagesPage() {
  return (
    <RequireAuth>
      <RequireVerifiedEmail>
        <MessagesContent />
      </RequireVerifiedEmail>
    </RequireAuth>
  );
}

function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<Conversation[]>('/api/messaging/conversations');
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await apiRequest<Message[]>(`/api/messaging/conversations/${conversationId}/messages`);
      if (response.success && response.data) {
        setMessages(response.data);
        // Mark as read
        await apiRequest(`/api/messaging/conversations/${conversationId}/mark-read`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
        // Refresh conversations to update unread count
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const response = await apiRequest<Message>(`/api/messaging/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: newMessage }),
      });
      
      if (response.success && response.data) {
        setMessages([...messages, response.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader title="Messages" description="Communicate securely" />
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Messages"
          description="Communicate with employers and candidates securely"
        />

        {conversations.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
            title="No conversations yet"
            description="Start a conversation by applying to a job or when an employer contacts you."
            action={{ label: 'Browse Jobs', href: '/jobs' }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card variant="default" className="md:col-span-1">
              <CardBody className="p-0">
                <div className="border-b p-4">
                  <h3 className="font-semibold text-gray-900">Conversations</h3>
                </div>
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedConversation === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-gray-900">{conv.otherUserName}</span>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-[var(--brand-primary)] text-white">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessageText}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Messages Thread */}
            <Card variant="default" className="md:col-span-2">
              <CardBody className="p-0 flex flex-col h-[600px]">
                {selectedConversation ? (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messagesLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.senderId === 'me'
                                  ? 'bg-[var(--brand-primary)] text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm font-medium mb-1">{msg.senderName}</p>
                              <p>{msg.text}</p>
                              <p className="text-xs mt-1 opacity-75">
                                {new Date(msg.sentAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Send Message */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sending}
                          variant="primary"
                        >
                          {sending ? 'Sending...' : 'Send'}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a conversation to view messages
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
