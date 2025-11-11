import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface ApprovedParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  approvedAt: string;
}

// Mock data - Replace with actual API call
const mockApprovedParticipants: ApprovedParticipant[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', rating: 4.8, approvedAt: '2024-01-15' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', rating: 4.5, approvedAt: '2024-01-17' },
  { id: '6', name: 'Emily Davis', email: 'emily@example.com', phone: '+1234567895', rating: 4.9, approvedAt: '2024-01-20' },
  { id: '7', name: 'Michael Wilson', email: 'michael@example.com', phone: '+1234567896', rating: 4.2, approvedAt: '2024-01-21' },
];

const Approved = () => {
  const [participants, setParticipants] = useState<ApprovedParticipant[]>(mockApprovedParticipants);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch data from API_ENDPOINTS.approvedParticipants
    // Example:
    // fetch(API_ENDPOINTS.approvedParticipants)
    //   .then(res => res.json())
    //   .then(data => setParticipants(data));
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
                    <TableHead>Rating</TableHead>
  
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.phone}</TableCell>
                      <TableCell>{renderStars(participant.rating)}</TableCell>
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
