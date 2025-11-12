import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface ApprovedParticipant {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  status: 'APPROVED' ;
  submittedAt: string;
}



const Approved = () => {
  const [participants, setParticipants] = useState<ApprovedParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  
          // Fetch only approved participants
          const res = await fetch(API_ENDPOINTS.approvedParticipants, { signal: controller.signal, headers });
          if (!res.ok) throw new Error(`Failed to fetch approved participants: ${res.status}`);
          const data = await res.json();
  
          // Expecting paginated response with `results` array
          const results = Array.isArray(data?.results) ? data.results : [];
  
          const mapped: ApprovedParticipant[] = results.map((p: any) => ({
            id: p.id,
            name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || 'Unknown',
            email: p.email || '',
            phone: p.phone || '',
            status: 'APPROVED' as const,
            submittedAt: p.registered_at || p.updated_at || '',
          }));
  
          if (mounted) setParticipants(mapped);
        } catch (err) {
          if ((err as any)?.name === 'AbortError') return;
          console.error('Error loading approved participants', err);
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'fill-primary text-primary'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approved Participants</h1>
          <p className="text-muted-foreground">All approved participants for the event</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approved List ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
  
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.phone}</TableCell>
                      {/* <TableCell>{renderStars(participant.rating)}</TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Approved;
