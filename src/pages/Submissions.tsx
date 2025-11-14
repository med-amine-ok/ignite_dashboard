import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { API_ENDPOINTS } from '@/config/api';

interface Participant {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  // Preserve raw API object so we can show full details without extra fetch
  raw?: any;
}

const Submissions = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadParticipants() {
      setIsLoading(true);
      try {
        const rawToken = localStorage.getItem('access_token') || localStorage.getItem('user');
        if (!rawToken) console.warn('No access token found in localStorage');

        const headers: Record<string, string> = {};
        if (rawToken) headers['Authorization'] = `Bearer ${rawToken}`;

        const res = await fetch(API_ENDPOINTS.participants, { signal: controller.signal, headers });
        if (!res.ok) throw new Error(`Failed to fetch participants: ${res.status}`);
        const data = await res.json();

        const results = Array.isArray(data?.results) ? data.results : [];

        const mapped: Participant[] = results.map((p: any) => ({
          id: p.id,
          name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || 'Unknown',
          email: p.email || '',
          phone: p.phone || '',
          status: (p.status as Participant['status']) || 'PENDING',
          submittedAt: p.registered_at || p.updated_at || '',
          raw: p,
        }));

        if (mounted) setParticipants(mapped);
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        console.error('Error loading participants', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadParticipants();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const updateParticipantStatus = async (id: number | string, newStatus: Participant['status']) => {
    setUpdatingId(id);
    try {
      const rawToken = localStorage.getItem('access_token') || localStorage.getItem('user');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (rawToken) headers['Authorization'] = `Bearer ${rawToken}`;

  const endpoint = API_ENDPOINTS.approveRejectParticipant(id);

      const actionMap: Record<Participant['status'], string> = {
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        'PENDING': 'pending',
      };
      const action = actionMap[newStatus];

      console.log('Updating participant:', { endpoint, action, headers });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action }),
      });

      const responseText = await res.text();
      console.log('Response status:', res.status, 'Body:', responseText);

      if (!res.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(`Failed to update participant status: ${res.status} - ${JSON.stringify(errorData)}`);
        } catch {
          throw new Error(`Failed to update participant status: ${res.status} - ${responseText}`);
        }
      }

      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      alert('Participant status updated successfully!');
    } catch (err) {
      console.error('Error updating participant status', err);
      alert(`Failed to update participant status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Participant['status']) => {
    const variants = {
      APPROVED: 'default' as const,
      PENDING: 'secondary' as const,
      REJECTED: 'destructive' as const,
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // Fields to display in the details view (in desired order)
  const detailFields = [
    'first_name',
    'last_name',
    'discord_username',
    'date_of_birth',
    'wilaya',
    'is_student',
    'university',
    'degree_and_major',
    'occupation',
    'knowledge_about_ignite',
    'motivation',
    'how_heard',
    'has_public_speaking_experience',
    'public_speaking_experience',
    'presentation_language',
    'talk_category',
    'presentation_theme',
    'theme_elaboration',
    'duo_talk_preference',
    'partner_name_and_relationship',
    'interview_preference',
    'additional_info',
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Submissions</h1>
          <p className="text-muted-foreground">View and manage all participant submissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Participants ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-4">Loading participants...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>{participant.phone}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant={participant.status === 'APPROVED' ? 'green' : 'outline'}
                            disabled={updatingId === participant.id}
                            onClick={() => updateParticipantStatus(participant.id, 'APPROVED')}
                          >
                            {updatingId === participant.id ? 'Updating...' : 'Approved'}
                          </Button>
                          <Button
                            size="sm"
                            variant={participant.status === 'PENDING' ? 'yellow' : 'outline'}
                            disabled={updatingId === participant.id}
                            onClick={() => updateParticipantStatus(participant.id, 'PENDING')}
                          >
                            {updatingId === participant.id ? 'Updating...' : 'Pending'}
                          </Button>
                          <Button
                            size="sm"
                            variant={participant.status === 'REJECTED' ? 'destructive' : 'outline'}
                            disabled={updatingId === participant.id}
                            onClick={() => updateParticipantStatus(participant.id, 'REJECTED')}
                          >
                            {updatingId === participant.id ? 'Updating...' : 'Rejected'}
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedParticipant?.id === participant.id ? 'default' : 'outline'}
                            onClick={() => setSelectedParticipant(participant)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal dialog for participant details */}
        <Dialog open={!!selectedParticipant} onOpenChange={(open) => { if (!open) setSelectedParticipant(null); }}>
          <DialogContent className="max-w-[80vw]">
            <DialogHeader>
              <DialogTitle>Participant details</DialogTitle>
            </DialogHeader>

            <div className="mt-4 max-h-[70vh]  overflow-auto">
              {selectedParticipant?.raw ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {detailFields.map((key) => {
                    const val = selectedParticipant.raw?.[key];
                    return (
                      <div key={key} className="flex flex-col">
                        <div className="font-medium text-sm text-muted-foreground">{key.replace(/_/g, ' ')}</div>
                        <div className="whitespace-pre-wrap break-words bg-muted/5 rounded-md p-2">{val === null || val === undefined ? '—' : String(val)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>No additional details available.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Submissions;
