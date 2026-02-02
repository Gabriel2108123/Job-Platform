import React, { useEffect, useState } from 'react';
import { PotentialCoworkerDto, getPotentialCoworkers, sendConnectionRequest } from '@/lib/api/client';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, UserPlus, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';

export function PotentialCoworkerList() {
    const [coworkers, setCoworkers] = useState<PotentialCoworkerDto[]>([]);
    const [sentIds, setSentIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCoworkers();
    }, []);

    async function loadCoworkers() {
        try {
            setLoading(true);
            const data = await getPotentialCoworkers();
            setCoworkers(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load potential coworkers');
        } finally {
            setLoading(false);
        }
    }

    const handleSendRequest = async (coworker: PotentialCoworkerDto) => {
        try {
            const result = await sendConnectionRequest({
                receiverId: coworker.candidateUserId,
                placeKey: coworker.placeKey,
                workplaceName: coworker.sharedWorkplace
            });

            if (result.success) {
                setSentIds(prev => new Set(prev).add(coworker.candidateUserId));
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to send request. You may have reached your daily limit.');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading network...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    if (coworkers.length === 0) {
        return (
            <Card>
                <CardBody className="pt-6 text-center text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>No potential coworkers found yet.</p>
                    <p className="text-sm">Ensure you have "Discoverable by Workplaces" enabled in settings.</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                People you might know ({coworkers.length})
            </h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coworkers.map((coworker) => (
                    <Card key={`${coworker.candidateUserId}-${coworker.placeKey}`}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-base font-semibold">
                                        {coworker.firstName} {coworker.lastNameInitial}.
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Worked at {coworker.sharedWorkplace}
                                    </p>
                                </div>
                                {sentIds.has(coworker.candidateUserId) ? (
                                    <Badge variant="success" size="sm">
                                        <Check className="h-3 w-3 mr-1" />
                                        Sent
                                    </Badge>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleSendRequest(coworker)}
                                        title="Connect"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                    Overlap: {format(new Date(coworker.overlapStart), 'MMM yyyy')} - {format(new Date(coworker.overlapEnd), 'MMM yyyy')}
                                    <Badge variant="neutral" size="sm" className="ml-2 text-[10px] h-4">
                                        {coworker.overlapDays} days
                                    </Badge>
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
