import React, { useEffect, useState } from 'react';
import { ConnectionDto, getPendingConnections, acceptConnection, declineConnection, getAcceptedConnections } from '@/lib/api/client';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserCheck, UserX, Inbox, Users } from 'lucide-react';
import { format } from 'date-fns';

export function ConnectionInbox() {
    const [pending, setPending] = useState<ConnectionDto[]>([]);
    const [connections, setConnections] = useState<ConnectionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        try {
            setLoading(true);
            const [pendingData, connectionsData] = await Promise.all([
                getPendingConnections(),
                getAcceptedConnections()
            ]);
            setPending(pendingData);
            setConnections(connectionsData);
        } catch (err) {
            console.error(err);
            setError('Failed to load connections');
        } finally {
            setLoading(false);
        }
    }

    const handleAction = async (id: string, action: 'accept' | 'decline') => {
        try {
            if (action === 'accept') {
                await acceptConnection(id);
            } else {
                await declineConnection(id);
            }
            loadAll();
        } catch (err) {
            console.error(err);
            alert('Action failed. Please try again.');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading inbox...</div>;

    return (
        <div className="space-y-8">
            {/* Pending Requests */}
            <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Inbox className="h-5 w-5" />
                    Pending Requests ({pending.length})
                </h3>
                {pending.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No pending requests.</p>
                ) : (
                    <div className="grid gap-4">
                        {pending.map((req) => (
                            <Card key={req.id}>
                                <CardBody className="flex items-center justify-between p-4">
                                    <div>
                                        <h4 className="font-bold">{req.otherUserName}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Wants to connect (Worked at {req.workplaceName})
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Received {format(new Date(req.requestedAt), 'MMM do')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAction(req.id, 'accept')}
                                            className="bg-[var(--success)] text-white hover:bg-[var(--success)]/90"
                                        >
                                            <UserCheck className="h-4 w-4 mr-1" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAction(req.id, 'decline')}
                                        >
                                            <UserX className="h-4 w-4 mr-1" />
                                            Decline
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Accepted Connections */}
            <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5" />
                    My Connections ({connections.length})
                </h3>
                {connections.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">You haven't connected with anyone yet.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {connections.map((conn) => (
                            <Card key={conn.id}>
                                <CardBody className="p-4">
                                    <h4 className="font-bold">{conn.otherUserName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Connect at {conn.workplaceName}
                                    </p>
                                    <Badge variant="success" size="sm" className="mt-2">
                                        Connected
                                    </Badge>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
