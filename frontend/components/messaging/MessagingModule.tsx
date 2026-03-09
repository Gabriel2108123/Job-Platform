'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api/client';
import { ReportModal } from '@/components/modals/ReportModal';
import { MessageSquare, Search, Filter, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';

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

export function MessagingModule() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [safetyActionLoading, setSafetyActionLoading] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation);
        }
    }, [selectedConversation]);

    const selectedConvData = conversations.find(c => c.id === selectedConversation);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const response = await apiRequest<{ items: Conversation[]; pageNumber: number; totalCount: number }>('/api/messaging/conversations');
            if (response.success && response.data) {
                setConversations(response.data.items);
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
            const response = await apiRequest<{ items: Message[]; pageNumber: number; totalCount: number }>(`/api/messaging/conversations/${conversationId}/messages`);
            if (response.success && response.data) {
                setMessages(response.data.items);
                // Mark as read
                await apiRequest(`/api/messaging/conversations/${conversationId}/mark-read`, {
                    method: 'PUT',
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
            } else {
                alert(response.error || 'Failed to send message.');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleBlockUser = async () => {
        if (!selectedConvData || !confirm(`Are you sure you want to block ${selectedConvData.otherUserName}?`)) return;

        setSafetyActionLoading(true);
        try {
            const response = await apiRequest('/api/safety/block', {
                method: 'POST',
                body: JSON.stringify({ blockedUserId: selectedConvData.otherUserId })
            });

            if (response.success) {
                setSelectedConversation(null);
                fetchConversations();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSafetyActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const filteredConversations = conversations.filter(c => 
        c.otherUserName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
            {/* Sidebar */}
            <div className="w-80 flex flex-col gap-6 shrink-0">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-poppins"
                    />
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 font-poppins">All Chats</h3>
                        <Filter className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {filteredConversations.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">No chats found</p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv.id)}
                                    className={`w-full p-4 rounded-2xl text-left transition-all ${selectedConversation === conv.id ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-xs font-black font-poppins ${selectedConversation === conv.id ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>{conv.otherUserName}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 truncate leading-relaxed">{conv.lastMessageText}</p>
                                    {conv.unreadCount > 0 && (
                                        <div className="mt-2 text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full inline-block">
                                            {conv.unreadCount} NEW
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden">
                {selectedConversation ? (
                    <>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase">
                                    {selectedConvData?.otherUserName?.substring(0, 1)}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-slate-900 dark:text-white font-poppins">{selectedConvData?.otherUserName}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Active Now
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setReportModalOpen(true)}
                                    className="rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest h-9"
                                >
                                    Report
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBlockUser}
                                    className="rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-rose-500 h-9"
                                >
                                    Block
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 dark:bg-transparent">
                            {messagesLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-6 py-4 rounded-[1.75rem] shadow-sm relative ${msg.senderId === 'me'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                                }`}
                                        >
                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                            <p className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-60 ${msg.senderId === 'me' ? 'text-white' : 'text-slate-400'}`}>
                                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex gap-3">
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Write a message..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-poppins"
                                    disabled={safetyActionLoading}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending || safetyActionLoading}
                                    className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                                >
                                    {sending ? '...' : 'Send'}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 font-montserrat">Select a conversation</h3>
                        <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                            Pick a professional contact to start collaborating or discussing opportunities.
                        </p>
                    </div>
                )}
            </div>

            {selectedConvData && (
                <ReportModal
                    isOpen={reportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    targetType="User"
                    targetId={selectedConvData.otherUserId}
                    targetName={selectedConvData.otherUserName}
                />
            )}
        </div>
    );
}
