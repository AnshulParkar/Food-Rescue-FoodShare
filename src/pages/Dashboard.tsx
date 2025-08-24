import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LineChart, BarChart2, MapIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DashboardNavigation from '@/components/DashboardNavigation';
import { DonationItem } from '@/components/DonationCard';
import { DonationFormValues } from '@/components/DonationForm';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { NotificationItem } from '@/components/dashboard/types';
import { apiMethods } from '@/services/api';

// Import all dashboard view components
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DefaultView from '@/components/dashboard/DefaultView';
import LoadingView from '@/components/dashboard/LoadingView';
import RefreshView from '@/components/dashboard/RefreshView';
import ReservationsView from '@/components/dashboard/ReservationsView';
import AvailableDonationsView from '@/components/dashboard/AvailableDonationsView';
import DeliveriesView from '@/components/dashboard/DeliveriesView';
import MapView from '@/components/dashboard/MapView';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import EducationalContent from '@/components/EducationalContent';
import DonationView from '@/components/dashboard/DonationView';
import RecipientCampaigns from '@/components/dashboard/RecipientCampaigns';

// Using mock notifications for now
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'New Donation Available',
    description: 'Fresh Sandwich Platter has been listed near your location',
    time: '10 minutes ago',
    read: false,
  },
  {
    id: '2',
    title: 'Donation Reserved',
    description: 'Your "Bakery Items Assortment" has been reserved',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '3',
    title: 'Delivery Completed',
    description: 'Pasta & Sauce Meal Kits was successfully delivered',
    time: 'Yesterday',
    read: true,
  },
];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [activeView, setActiveView] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Extract the view from the URL path
  useEffect(() => {
    const path = location.pathname.split('/');
    const view = path[path.length - 1];
    
    // Only set the view if it's a valid route
    if (view && view !== 'dashboard') {
      setActiveView(view);
      
      // Refresh donations when changing to views that need donation data
      if (['overview', 'available', 'reserved', 'deliveries'].includes(view)) {
        fetchDonations();
      }
    } else {
      setActiveView('overview');
      fetchDonations();
    }
  }, [location.pathname]);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const donationData = await apiMethods.getDonations();
      console.log("Fetched donations:", donationData);
      setDonations(donationData);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFilteredDonations = (status?: DonationItem['status']) => {
    if (!currentUser) return [];
    
    // Log the actual structure of the first donation for debugging
    if (donations.length > 0) {
      console.log("First donation object structure:", donations[0]);
    }
    
    // Handle both _id (MongoDB style) and id properties
    let filtered = [...donations].filter(donation => {
      // Check if the donation exists and has either id or _id
      return donation && (donation.id || donation._id);
    });
    console.log("After ID filter:", filtered);
    
    if (status) {
      filtered = filtered.filter(donation => donation.status === status);
      console.log(`After status '${status}' filter:`, filtered);
    }
    
    if (currentUser.role === 'donor') {
      filtered = filtered.filter(donation => donation.donorId === currentUser.id);
      console.log("After donor filter:", filtered);
    } else if (currentUser.role === 'volunteer') {
      if (!status) {
        filtered = filtered.filter(donation => 
          donation.status === 'reserved' || donation.status === 'completed'
        );
        console.log("After volunteer filter:", filtered);
      }
    }
    
    console.log("Final filtered donations:", filtered);
    return filtered;
  };

  const handleStatusChange = async (id: string, newStatus: DonationItem['status'], recipientId?: string, pickupTime?: Date) => {
    if (!id) {
      console.error("Cannot update status: Missing donation ID");
      toast.error("Failed to update donation status: Missing ID");
      return;
    }
    
    try {
      console.log(`Updating donation ${id} to status: ${newStatus}`);
      const response = await apiMethods.updateDonationStatus(id, newStatus, recipientId, pickupTime);
      
      // Update local state with the updated donation
      setDonations(donations.map(donation => {
        // Check if this is the donation we're updating (using either id or _id)
        if ((donation.id && donation.id === id) || (donation._id && donation._id === id)) {
          return { 
            ...donation, 
            status: newStatus,
            recipientId: recipientId || donation.recipientId,
            pickupTime: pickupTime ? pickupTime.toISOString() : donation.pickupTime
          };
        }
        return donation;
      }));
      
      if (newStatus === 'reserved') {
        toast.success("Donation reserved successfully! Check your reservations for pickup details.");
      } else if (newStatus === 'completed') {
        toast.success("Donation marked as completed!");
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      toast.error('Failed to update donation status. Please try again.');
    }
  };

  const handleAddDonation = async (formData: DonationFormValues) => {
    if (!currentUser) return;
    
    try {
      const donationData = {
        title: formData.title,
        description: formData.description,
        donorName: currentUser.name,
        donorId: currentUser.id,
        location: formData.location,
        expiry: formData.expiry.toISOString(),
        quantity: formData.quantity,
        imageUrl: formData.imageUrl,
        foodType: formData.foodType,
        status: 'available',
      };
      
      const response = await apiMethods.createDonation(donationData);
      
      // Add the new donation to the local state
      setDonations([response.donation, ...donations]);
      toast.success("Donation created and stored in database successfully!");
      setActiveView('overview');
    } catch (error) {
      console.error('Error creating donation:', error);
      toast.error('Failed to create donation. Please try again.');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDonations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate('/signin');
    }
  }, [currentUser, isLoading, navigate]);

  if (!currentUser) {
    return null;
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <DashboardOverview 
            user={currentUser}
            donations={donations}
            notifications={notifications}
            setNotifications={setNotifications}
            getFilteredDonations={getFilteredDonations}
            handleStatusChange={handleStatusChange}
            setActiveView={setActiveView}
          />
        );
      
      case 'donate':
        return <DonationView handleAddDonation={handleAddDonation} />;
        
      case 'available':
        return (
          <AvailableDonationsView 
            getFilteredDonations={getFilteredDonations} 
            handleStatusChange={handleStatusChange} 
          />
        );
        
      case 'deliveries':
        return (
          <DeliveriesView 
            getFilteredDonations={getFilteredDonations} 
            handleStatusChange={handleStatusChange} 
          />
        );
        
      case 'reserved':
        return (
          <ReservationsView 
            getFilteredDonations={getFilteredDonations} 
            handleStatusChange={handleStatusChange}
            setActiveView={setActiveView}
          />
        );
        
      case 'analytics':
        return <AnalyticsDashboard />;
        
      case 'education':
        return <EducationalContent />;
        
      case 'map':
        return <MapView donations={donations} />;
        
      case 'refresh':
        return <RefreshView setActiveView={setActiveView} onRefresh={fetchDonations} />;
        
      case 'campaigns':
        return <RecipientCampaigns />;
        
      default:
        return <DefaultView />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {isLoading ? (
          <LoadingView />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            <div className="hidden md:block">
              <DashboardNavigation />
            </div>
            
            <div className="overflow-hidden md:overflow-visible">
              {renderMainContent()}
            </div>
            
            <div className="md:hidden sticky bottom-0 left-0 right-0 border-t bg-background p-2 z-20">
              <div className="overflow-x-auto pb-2">
                <DashboardNavigation />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
