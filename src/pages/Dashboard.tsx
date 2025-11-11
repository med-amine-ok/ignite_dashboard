import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, Star } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API_ENDPOINTS } from '@/config/api';

// Mock data - Replace with actual API calls
const mockStats = {
  totalParticipants: 248,
  approved: 186,
  pending: 62,
  averageRating: 4.3,
};

const mockGrowthData = [
  { month: 'Jan', participants: 45 },
  { month: 'Feb', participants: 68 },
  { month: 'Mar', participants: 92 },
  { month: 'Apr', participants: 125 },
  { month: 'May', participants: 186 },
  { month: 'Jun', participants: 248 },
];

const mockRatingsData = [
  { rating: '5 Stars', count: 98 },
  { rating: '4 Stars', count: 65 },
  { rating: '3 Stars', count: 18 },
  { rating: '2 Stars', count: 4 },
  { rating: '1 Star', count: 1 },
];

const COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];

const Dashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [growthData, setGrowthData] = useState(mockGrowthData);
  const [ratingsData, setRatingsData] = useState(mockRatingsData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch data from API_ENDPOINTS.statsOverview and API_ENDPOINTS.statsRatings
    // Example:
    // fetch(API_ENDPOINTS.statsOverview)
    //   .then(res => res.json())
    //   .then(data => setStats(data));
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
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            trend={{ value: -3, isPositive: false }}
          />
          <StatCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            icon={Star}
            trend={{ value: 0.2, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Participant Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="participants" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ratings Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ rating, percent }) => `${rating}: ${(percent * 100).toFixed(0)}%`}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
