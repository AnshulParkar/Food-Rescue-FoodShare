import { useState } from 'react';
import { 
  Utensils, Calendar, Users, MessageSquare, Bell, 
  ListFilter, ArrowRight, RefreshCcw, LineChart, BarChart2, MapIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DonationCard, { DonationItem } from '@/components/DonationCard';
import { toast } from 'sonner';
import { NotificationItem } from './types';

interface DashboardOverviewProps {
  user: any;
  donations: DonationItem[];
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  getFilteredDonations: (status?: DonationItem['status']) => DonationItem[];
  handleStatusChange: (id: string, newStatus: DonationItem['status']) => void;
  setActiveView: (view: string) => void;
}

const DashboardOverview = ({
  user,
  donations,
  notifications,
  setNotifications,
  getFilteredDonations,
  handleStatusChange,
  setActiveView
}: DashboardOverviewProps) => {
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    toast.success("All notifications marked as read");
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}!
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2 md:mt-0"
          onClick={() => setActiveView('refresh')}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Donations
                </CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getFilteredDonations('available').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.role === 'donor' 
                    ? '+2 from last week' 
                    : 'in your area'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user.role === 'donor' 
                    ? 'Reserved Items' 
                    : user.role === 'recipient'
                      ? 'Your Reservations'
                      : 'Pending Deliveries'}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getFilteredDonations('reserved').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  awaiting {user.role === 'volunteer' ? 'delivery' : 'pickup'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user.role === 'donor' 
                    ? 'Community Impact' 
                    : 'Recent Activity'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.role === 'donor' 
                    ? '24 meals' 
                    : '12 actions'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.role === 'donor' 
                    ? 'provided this month' 
                    : 'in the last 30 days'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Messages
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  3
                </div>
                <p className="text-xs text-muted-foreground">
                  unread conversations
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredDonations().slice(0, 3).map((donation) => (
                    <div key={donation.id} className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                        <Utensils className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{donation.title}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {donation.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {getFilteredDonations().length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                        <Utensils className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No Activity Yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mt-1">
                        {user.role === 'donor' 
                          ? 'Start by creating your first donation listing' 
                          : user.role === 'recipient'
                            ? 'Browse available donations and make your first reservation'
                            : 'Check for delivery requests in your area'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Notifications</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllNotificationsAsRead}
                    className="text-xs h-7 px-2"
                  >
                    Mark all read
                  </Button>
                </div>
                <CardDescription>
                  Stay updated on platform activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-2">
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.read 
                            ? 'bg-transparent border-border/50' 
                            : 'bg-secondary/50 border-secondary'
                        }`}
                      >
                        {!notification.read && (
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 rounded-full bg-foodshare-500 mr-2"></div>
                            <span className="text-xs text-foodshare-600">New</span>
                          </div>
                        )}
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-6 px-2"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Donations</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <ListFilter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All Donations</DropdownMenuItem>
                <DropdownMenuItem>Available</DropdownMenuItem>
                <DropdownMenuItem>Reserved</DropdownMenuItem>
                <DropdownMenuItem>Completed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredDonations().slice(0, 3).map((donation) => (
              <DonationCard 
                key={donation.id} 
                donation={donation} 
                onStatusChange={handleStatusChange}
              />
            ))}
            
            {getFilteredDonations().length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No Donations Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6">
                  {user.role === 'donor' 
                    ? 'You haven\'t created any donations yet. Start by listing your first donation.' 
                    : 'There are no donations matching your criteria at this time.'}
                </p>
                
                {user.role === 'donor' && (
                  <Button 
                    onClick={() => setActiveView('donate')}
                    className="bg-foodshare-500 hover:bg-foodshare-600 text-white"
                  >
                    Create Donation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="donations" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">All Donations</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <ListFilter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All Donations</DropdownMenuItem>
                <DropdownMenuItem>Available</DropdownMenuItem>
                <DropdownMenuItem>Reserved</DropdownMenuItem>
                <DropdownMenuItem>Completed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredDonations().map((donation) => (
              <DonationCard 
                key={donation.id} 
                donation={donation} 
                onStatusChange={handleStatusChange}
              />
            ))}
            
            {getFilteredDonations().length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No Donations Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6">
                  {user.role === 'donor' 
                    ? 'You haven\'t created any donations yet. Start by listing your first donation.' 
                    : 'There are no donations matching your criteria at this time.'}
                </p>
                
                {user.role === 'donor' && (
                  <Button 
                    onClick={() => setActiveView('donate')}
                    className="bg-foodshare-500 hover:bg-foodshare-600 text-white"
                  >
                    Create Donation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-4 w-4" />
                  {user.role === 'donor' 
                    ? 'Your Donation Activity' 
                    : user.role === 'recipient'
                      ? 'Food Received'
                      : 'Delivery Activity'}
                </CardTitle>
                <CardDescription>
                  {user.role === 'donor' 
                    ? 'Donations over time' 
                    : user.role === 'recipient'
                      ? 'Food received over time'
                      : 'Deliveries completed over time'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Chart visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapIcon className="mr-2 h-4 w-4" />
                  Geographic Impact
                </CardTitle>
                <CardDescription>
                  Communities you've helped
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Map visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Impact Summary</CardTitle>
              <CardDescription>
                Your contribution to reducing waste and fighting hunger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Meals Shared</p>
                    <h3 className="text-2xl font-bold">
                      {user.role === 'donor' ? '42' : user.role === 'recipient' ? '89' : '156'}
                    </h3>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Food Saved (kg)</p>
                    <h3 className="text-2xl font-bold">
                      {user.role === 'donor' ? '68' : user.role === 'recipient' ? '142' : '275'}
                    </h3>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">CO₂ Reduced</p>
                    <h3 className="text-2xl font-bold">
                      {user.role === 'donor' ? '38' : user.role === 'recipient' ? '78' : '145'}
                      <span className="text-sm">kg</span>
                    </h3>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Top Food Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prepared Meals</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="bg-foodshare-500 h-full" style={{ width: '70%' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">70%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fresh Produce</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="bg-foodshare-500 h-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bakery Items</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="bg-foodshare-500 h-full" style={{ width: '30%' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">30%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardOverview;
