import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { apiMethods, DonationItem } from "@/services/api";
import MapComponent from "../MapAll";


const getLocationCoords = (location: string) => {
  const match = location.match(/Lat:\s*([-0-9.]+),\s*Lng:\s*([-0-9.]+)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng] as [number, number];
    }
  }
  return [20.5937, 78.9629] as [number, number]; // Default (India) if parsing fails
};

const MapView = () => {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [markers, setMarkers] = useState<{ position: [number, number]; tooltip: string }[]>([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await apiMethods.getDonations();
        setDonations(response);

        const extractedMarkers = response.map((donation: DonationItem) => ({
          position: getLocationCoords(donation.location),
          tooltip: donation.title,
        }));

        setMarkers(extractedMarkers);
      } catch (error) {
        console.error("Error fetching donations:", error);
      }
    };

    fetchDonations();
  }, []);

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Donation Map</h1>
        <p className="text-muted-foreground">See where food donations and needs are located</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Food Sharing Map</CardTitle>
          <CardDescription>View the locations of donors, recipients, and volunteers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-foodshare-500"></div>
              <span className="text-sm">Donors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm">Recipients</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Volunteers</span>
            </div>
          </div>

          <MapComponent markers={markers} height="500px" />
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
