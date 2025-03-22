// import { useEffect, useRef } from 'react';

// const Map = () => {
//   return (
//     <div className="w-full h-full min-h-[400px] rounded-lg bg-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
//       {/* Simple Map Representation */}
//       <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
//         {/* Grid lines */}
//         {Array.from({ length: 10 }).map((_, i) => (
//           <div key={`h-${i}`} className="col-span-10 border-b border-gray-300" />
//         ))}
//         {Array.from({ length: 10 }).map((_, i) => (
//           <div key={`v-${i}`} className="row-span-10 border-r border-gray-300" />
//         ))}
        
//         {/* Random donation points */}
//         {Array.from({ length: 15 }).map((_, i) => (
//           <div 
//             key={`point-${i}`}
//             className="absolute w-3 h-3 rounded-full bg-primary shadow-md"
//             style={{
//               left: `${Math.random() * 90 + 5}%`,
//               top: `${Math.random() * 90 + 5}%`,
//               transform: 'translate(-50%, -50%)',
//               boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.2)'
//             }}
//           />
//         ))}
        
//         {/* Center point */}
//         <div 
//           className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-green-700 z-10"
//           style={{
//             transform: 'translate(-50%, -50%)',
//             boxShadow: '0 0 0 4px rgba(22, 101, 52, 0.2)'
//           }}
//         />
//       </div>
      
//       {/* Map label */}
//       <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-sm font-medium z-20">
//         Donation Locations Map
//       </div>
//     </div>
//   );
// };

// export default Map;
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icons in bundlers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center: [number, number];
  markers?: Array<{
    position: [number, number];
    tooltip: string;
    type?: "donor" | "recipient" | "volunteer";
  }>;
  height?: string;
  className?: string;
  onLocationSelect?: (lat: number, lng: number) => void; // Callback function to get clicked location
}

const Map = ({ 
  center, 
  markers = [], 
  height = "400px", 
  className = "", 
  onLocationSelect 
}: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map with dynamic center
    const map = L.map(mapRef.current).setView(center, 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Handle map click to get coordinates
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation([lat, lng]);

      if (onLocationSelect) {
        onLocationSelect(lat, lng); // Send clicked coordinates to parent component
      }

      // Add a marker to the clicked location
      L.marker([lat, lng], { icon: DefaultIcon })
        .addTo(map)
        .bindPopup(`Selected Location: <br> ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        .openPopup();
    });

    // Add markers if provided
    markers.forEach((marker) => {
      const { position, tooltip, type = "donor" } = marker;

      // Define custom icon based on type
      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white ${
          type === "donor"
            ? "bg-foodshare-500"
            : type === "recipient"
            ? "bg-purple-500"
            : "bg-green-500"
        }">
          ${
            type === "donor"
              ? "D"
              : type === "recipient"
              ? "R"
              : "V"
          }
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const newMarker = L.marker(position, { icon: markerIcon }).addTo(map);

      if (tooltip) {
        newMarker.bindPopup(`
          <div class="text-sm font-medium">${tooltip}</div>
          <div class="text-xs text-gray-500">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        `);
      }
    });

    // Save the map instance
    mapInstanceRef.current = map;

    // Invalidate map size when it becomes visible
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, markers, onLocationSelect]);

  return (
    <div className={`overflow-hidden rounded-lg border border-border/70 ${className}`}>
      <div ref={mapRef} style={{ height }} className="z-10"></div>

      {/* Display selected coordinates */}
      {selectedLocation && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
          Selected Location: {selectedLocation[0].toFixed(5)}, {selectedLocation[1].toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default Map;
