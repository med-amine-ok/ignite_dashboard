import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Trophy } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface RatedParticipant {
  id: string;
  name: string;
  email: string;
  averageRating: number;
  totalRatings: number;
}

// Mock data - Replace with actual API call
const mockRatings: RatedParticipant[] = [
  { id: '6', name: 'Emily Davis', email: 'emily@example.com', averageRating: 4.9, totalRatings: 24 },
  { id: '1', name: 'John Doe', email: 'john@example.com', averageRating: 4.8, totalRatings: 21 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', averageRating: 4.5, totalRatings: 18 },
  { id: '7', name: 'Michael Wilson', email: 'michael@example.com', averageRating: 4.2, totalRatings: 15 },
];

const Ratings = () => {
  const [ratings, setRatings] = useState<RatedParticipant[]>(mockRatings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch data from API_ENDPOINTS.ratings
    // Example:
    // fetch(API_ENDPOINTS.ratings)
    //   .then(res => res.json())
    //   .then(data => setRatings(data));
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.floor(rating)
                ? 'fill-primary text-primary'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Trophy className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ratings Leaderboard</h1>
          <p className="text-muted-foreground">Top-rated participants in the event</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
                >
                  <div className="flex w-12 items-center justify-center">
                    {getRankBadge(index)}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{participant.name}</h3>
                    <p className="text-sm text-muted-foreground">{participant.email}</p>
                  </div>
                  <div className="text-right">
                    {renderStars(participant.averageRating)}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {participant.totalRatings} ratings
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {participant.averageRating.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Ratings;
