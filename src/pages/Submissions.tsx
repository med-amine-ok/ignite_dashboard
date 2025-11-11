import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';

interface Participant {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}


const Submissions = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadParticipants() {
      setIsLoading(true);
      try {
        // Try to read token from localStorage. The project previously stored the
        // access token either under `access_token` or (unfortunately) under
        // `user` in some flows — try both.
        const rawToken = localStorage.getItem('access_token') || localStorage.getItem('user');
        if (!rawToken) console.warn('No access token found in localStorage');

        const headers: Record<string, string> = {};
        if (rawToken) headers['Authorization'] = `Bearer ${rawToken}`;

        const res = await fetch(API_ENDPOINTS.participants, { signal: controller.signal, headers });
        if (!res.ok) throw new Error(`Failed to fetch participants: ${res.status}`);
        const data = await res.json();

        // Expecting paginated response with `results` array
        const results = Array.isArray(data?.results) ? data.results : [];

        const mapped: Participant[] = results.map((p: any) => ({
          id: p.id,
          name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || 'Unknown',
          email: p.email || '',
          phone: p.phone || '',
          status: (p.status as Participant['status']) || 'PENDING',
          submittedAt: p.registered_at || p.updated_at || '',
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

      const endpoint = `/api/participants/view/${id}/approve_reject/`;
      
      // Map status to action (action field is required by the API)
      const actionMap: Record<Participant['status'], string> = {
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        'PENDING': 'pending',
      };
      const action = actionMap[newStatus];
      
      // Log the request details for debugging
      console.log('Updating participant:', { endpoint, action, headers });
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action }),
      });

      // Get response body for error details
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

      // Update local state
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
                      {/* <TableHead>Status</TableHead> */}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>{participant.phone}</TableCell>
                        {/* <TableCell>{getStatusBadge(participant.status)}</TableCell> */}
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant={participant.status === 'APPROVED' ? 'default' : 'outline'}
                            disabled={updatingId === participant.id}
                            onClick={() => updateParticipantStatus(participant.id, 'APPROVED')}
                          >
                            {updatingId === participant.id ? 'Updating...' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant={participant.status === 'PENDING' ? 'default' : 'outline'}
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
                            {updatingId === participant.id ? 'Updating...' : 'Reject'}
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
      </div>
    </DashboardLayout>
  );
};

export default Submissions;
