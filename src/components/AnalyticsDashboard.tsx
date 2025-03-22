import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Bar, Line, Pie } from "recharts";
import { CircleUser, Utensils, CalendarClock, Users, MapPin, Trophy, Calculator, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { apiMethods, AnalyticsData } from "@/services/api";
import { toast } from "sonner";
import Map from "./Map";
import MapView from "./dashboard/MapView";

// Define colors for consistent styling
const COLORS = {
  available: "#16a34a",   // Green
  reserved: "#f59e0b",    // Amber
  completed: "#3b82f6",   // Blue
  alert: "#ef4444",       // Red
  primary: "#f97316",     // Orange
  secondary: "#8b5cf6",   // Purple
  muted: "#6b7280",       // Gray
};

// Define food type colors
const FOOD_TYPE_COLORS = [
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#ef4444", // Red
  "#0ea5e9", // Sky
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f43f5e", // Rose
  "#84cc16"  // Lime
];

// Mock data for testing
const MOCK_ANALYTICS_DATA: AnalyticsData = {
  overview: {
    totalDonations: 879,
    availableDonations: 147,
    reservedDonations: 324,
    completedDonations: 408,
    uniqueDonors: 32,
    uniqueLocations: 17,
    estimatedMealsProvided: 3450,
    estimatedFoodWasteSaved: 724,
    estimatedCO2Saved: 1328,
    expiringToday: 12,
    expiringThisWeek: 35,
  },
  charts: {
    monthlyDonations: [
      { month: "Jan", donations: 45 },
      { month: "Feb", donations: 52 },
      { month: "Mar", donations: 49 },
      { month: "Apr", donations: 63 },
      { month: "May", donations: 58 },
      { month: "Jun", donations: 64 },
      { month: "Jul", donations: 75 },
      { month: "Aug", donations: 83 },
      { month: "Sep", donations: 87 },
      { month: "Oct", donations: 92 },
      { month: "Nov", donations: 101 },
      { month: "Dec", donations: 110 },
    ],
    foodTypeData: [
      { name: "Prepared Meals", value: 42 },
      { name: "Fresh Produce", value: 28 },
      { name: "Bakery Items", value: 15 },
      { name: "Canned Goods", value: 10 },
      { name: "Beverages", value: 5 },
    ],
    statusData: [
      { name: "Available", value: 147 },
      { name: "Reserved", value: 324 },
      { name: "Completed", value: 408 },
    ],
  },
  topDonors: [
    { name: "Fresh Harvest Bakery", donations: 87, percent: 100 },
    { name: "Green Grocers", donations: 75, percent: 86 },
    { name: "Pasta Palace", donations: 64, percent: 74 },
    { name: "City Catering Co.", donations: 52, percent: 60 },
    { name: "Health Juice Bar", donations: 43, percent: 49 },
  ],
};

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let data;
        try {
          data = await apiMethods.getAnalytics();
        } catch (apiError) {
          console.error("API error, using mock data:", apiError);
          // Use mock data if API call fails
          data = MOCK_ANALYTICS_DATA;
        }
        
        setAnalyticsData(data);
        console.log("Analytics data loaded:", data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again.");
        toast.error("Failed to load analytics data");
        
        // Fallback to mock data in case of any error
        setAnalyticsData(MOCK_ANALYTICS_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto" />
          <p className="mt-2">{error || "Something went wrong"}</p>
        </div>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const { overview, charts, topDonors } = analyticsData;

  // Build impact stats for the cards
  const impactStats = [
    { 
      title: "Total Donations", 
      value: overview.totalDonations.toString(),
      icon: <Utensils className="h-4 w-4" />,
      description: "Food items donated"
    },
    { 
      title: "Available Now", 
      value: overview.availableDonations.toString(),
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Items ready for pickup"
    },
    { 
      title: "Expiring Today", 
      value: overview.expiringToday.toString(),
      icon: <Clock className="h-4 w-4" />,
      description: "Requires urgent action"
    },
    { 
      title: "Unique Donors", 
      value: overview.uniqueDonors.toString(),
      icon: <Users className="h-4 w-4" />,
      description: "Contributing individuals"
    },
    { 
      title: "Communities Reached", 
      value: overview.uniqueLocations.toString(),
      icon: <MapPin className="h-4 w-4" />,
      description: "Local neighborhoods"
    },
    { 
      title: "Meals Provided", 
      value: overview.estimatedMealsProvided.toString(),
      icon: <Trophy className="h-4 w-4" />,
      description: "Estimated impact"
    },
    { 
      title: "Food Waste Reduced", 
      value: `${overview.estimatedFoodWasteSaved} kg`,
      icon: <Calculator className="h-4 w-4" />,
      description: "Diverted from landfill"
    },
    { 
      title: "CO₂ Reduction", 
      value: `${overview.estimatedCO2Saved} kg`,
      icon: <CalendarClock className="h-4 w-4" />,
      description: "Emissions saved"
    }
  ];

  // Add color to food type data
  const foodTypeWithColors = charts.foodTypeData.map((item, index) => ({
    ...item,
    color: FOOD_TYPE_COLORS[index % FOOD_TYPE_COLORS.length]
  }));

  // Status data with colors
  const statusWithColors = charts.statusData.map(item => ({
    ...item,
    color: item.name === 'Available' ? COLORS.available : 
           item.name === 'Reserved' ? COLORS.reserved : COLORS.completed
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
      <p className="text-muted-foreground">
        Real-time insights into your food sharing impact
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Donations</CardTitle>
                <CardDescription>Total donations by month for {new Date().getFullYear()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full aspect-[4/3]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.monthlyDonations}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-muted-foreground">
                                Donations: {payload[0].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="donations" 
                        name="Donations"
                        stroke={COLORS.primary}
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Food Distribution</CardTitle>
                <CardDescription>Breakdown by food category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full aspect-[4/3]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={foodTypeWithColors}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {foodTypeWithColors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} items`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Donation Status</CardTitle>
              <CardDescription>Current status of all donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-[3/1]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusWithColors}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Donations" 
                      radius={[4, 4, 0, 0]} 
                    >
                      {statusWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donation Trends</CardTitle>
              <CardDescription>Monthly donation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-[16/9]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.monthlyDonations}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-muted-foreground">
                              Donations: {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                    <Bar 
                      dataKey="donations" 
                      name="Donations" 
                      fill={COLORS.primary}
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CircleUser className="mr-2 h-4 w-4" />
                  Donor Leaderboard
                </CardTitle>
                <CardDescription>Top food contributors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDonors.map((donor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="font-medium">{donor.name}</div>
                        </div>
                        <span className="text-muted-foreground text-sm">{donor.donations} items</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${donor.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expiring Donations</CardTitle>
                <CardDescription>Items that need urgent attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Expiring Today</h4>
                      <span className="text-xl font-bold text-destructive">{overview.expiringToday}</span>
                    </div>
                    <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-destructive rounded-full" 
                        style={{ width: `${Math.min(100, (overview.expiringToday / Math.max(1, overview.availableDonations)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {overview.expiringToday > 0 
                        ? "These items need immediate action" 
                        : "No items expiring today"
                      }
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Expiring This Week</h4>
                      <span className="text-xl font-bold text-amber-500">{overview.expiringThisWeek}</span>
                    </div>
                    <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${Math.min(100, (overview.expiringThisWeek / Math.max(1, overview.availableDonations)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {overview.expiringThisWeek > 0 
                        ? "Plan for distribution soon" 
                        : "No items expiring this week"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="geographic" className="space-y-4">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Donation Locations</CardTitle>
              <CardDescription>Geographic distribution of food shares</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <MapView/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
