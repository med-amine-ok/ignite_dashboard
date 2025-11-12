import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Trophy } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface RatedParticipant {
  id: string;
  name: string;
  averageRating: number;
  totalRatings: number;
}



const Ratings = () => {
  const [ratings, setRatings] = useState<RatedParticipant[]>([]);
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
            const res = await fetch(API_ENDPOINTS.ratedParticipant, { signal: controller.signal, headers });
            if (!res.ok) throw new Error(`Failed to fetch rated participants: ${res.status}`);
            const data = await res.json();
    
            // Expecting paginated response with `results` array
            const results = Array.isArray(data?.results) ? data.results : [];
    
            const mapped: RatedParticipant[] = results.map((p: any) => ({
              id: p.participant_id,
              name: p.participant_name || 'Unknown',
              averageRating: p.average_rating || 0,
              totalRatings: p.total_ratings_count || 0,
            }));
    
            if (mounted) setRatings(mapped);
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
                  </div>
                  <div className="text-right">
                    {renderStars(participant.averageRating)}
                    <p className="mt-1 mr-12 text-sm text-muted-foreground">
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
