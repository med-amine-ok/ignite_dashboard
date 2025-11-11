import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/config/api';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

// Mock data - Replace with actual API call
const mockParticipants: Participant[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', status: 'APPROVED', submittedAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', status: 'PENDING', submittedAt: '2024-01-16' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', status: 'APPROVED', submittedAt: '2024-01-17' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', phone: '+1234567893', status: 'PENDING', submittedAt: '2024-01-18' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1234567894', status: 'REJECTED', submittedAt: '2024-01-19' },
];

const Submissions = () => {
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch data from API_ENDPOINTS.participants
    // Example:
    // fetch(API_ENDPOINTS.participants)
    //   .then(res => res.json())
    //   .then(data => setParticipants(data));
  }, []);

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.phone}</TableCell>
                      <TableCell>{getStatusBadge(participant.status)}</TableCell>
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

export default Submissions;
