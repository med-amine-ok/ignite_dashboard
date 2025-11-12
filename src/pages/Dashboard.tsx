import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, Star } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API_ENDPOINTS } from '@/config/api';

interface StatsOverview {
  totalParticipants: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface RatingsDistribution {
  rating: number;
  count: number;
}

const COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];

const Dashboard = () => {
  const [stats, setStats] = useState<StatsOverview>({
    totalParticipants: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [ratingsData, setRatingsData] = useState<RatingsDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      try {
        // Try to read token from localStorage
        const rawToken = localStorage.getItem('access_token') || localStorage.getItem('user');
        if (!rawToken) console.warn('No access token found in localStorage');

        const headers: Record<string, string> = {};
        if (rawToken) headers['Authorization'] = `Bearer ${rawToken}`;

        // Fetch stats overview from dashboard export endpoint
        const statsRes = await fetch(API_ENDPOINTS.statsOverview, { 
          signal: controller.signal, 
          headers 
        });
        if (!statsRes.ok) throw new Error(`Failed to fetch stats overview: ${statsRes.status}`);
        const statsData = await statsRes.json();

        // Extract participant stats from the response
        const participantStats = statsData?.participants || {};
        const totalParticipants = participantStats.total || 0;
        const approved = participantStats.approved || 0;
        const pending = participantStats.pending || 0;
        const rejected = participantStats.rejected || 0;

        // Fetch rated participants to get distribution
        const ratingsRes = await fetch(API_ENDPOINTS.ratedParticipant, { 
          signal: controller.signal, 
          headers 
        });
        const distribution: RatingsDistribution[] = [];

        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json();
          const ratedParticipants = Array.isArray(ratingsData?.results) ? ratingsData.results : [];
          
          if (ratedParticipants.length > 0) {
            // Build ratings distribution
            for (let rating = 5; rating >= 1; rating--) {
              const count = ratedParticipants.filter((p: any) => Math.floor(p.average_rating) === rating).length;
              distribution.push({ rating, count });
            }
          }

          if (mounted) {
            setRatingsData(distribution);
          }
        }

        // Update stats
        if (mounted) {
          setStats({
            totalParticipants,
            approved,
            pending,
            rejected,
          });
        }
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        console.error('Error loading dashboard data', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants}
            icon={Users}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            trend={{ value: 0, isPositive: false }}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={CheckCircle}
            trend={{ value: 0, isPositive: false }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Ratings Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-80 items-center justify-center text-muted-foreground">
                  Loading ratings data...
                </div>
              ) : ratingsData.length === 0 ? (
                <div className="flex h-80 items-center justify-center text-muted-foreground">
                  No ratings data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ratingsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rating, count }) => `${rating}★: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {ratingsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
