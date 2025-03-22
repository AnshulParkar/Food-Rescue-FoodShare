import { Utensils, RefreshCcw } from 'lucide-react';
import DonationCard, { DonationItem } from '@/components/DonationCard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AvailableDonationsViewProps {
  getFilteredDonations: (status?: DonationItem['status']) => DonationItem[];
  handleStatusChange: (id: string, newStatus: DonationItem['status']) => void;
}

const AvailableDonationsView = ({ getFilteredDonations, handleStatusChange }: AvailableDonationsViewProps) => {
  // Force component re-render
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refreshData = () => {
    // This will force a re-render
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Get available donations
  const availableDonations = getFilteredDonations('available');
  
  return (
    <div className="animate-fade-up" key={refreshKey}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Available Donations</h1>
          <p className="text-muted-foreground">
            Browse and reserve available food in your area
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="flex gap-2 items-center"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableDonations.map((donation) => (
          <DonationCard 
            key={donation.id} 
            donation={donation} 
            onStatusChange={handleStatusChange}
          />
        ))}
        
        {availableDonations.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Utensils className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Available Donations</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2">
              There are no available donations in your area at this time. 
              Check back later or expand your search area.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableDonationsView;
