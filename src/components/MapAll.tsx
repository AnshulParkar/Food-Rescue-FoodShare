import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  markers: { position: [number, number]; tooltip: string }[];
  height?: string;
}

const MapComponent = ({ markers, height = "400px" }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // If map already exists, remove previous markers and add new ones
    if (mapInstance.current) {
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) mapInstance.current?.removeLayer(layer);
      });
    } else {
      // Initialize the map only once
      mapInstance.current = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // Default center (India)
        zoom: 5,
        layers: [
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
        ],
      });
    }

    // Add markers
    markers.forEach(({ position, tooltip }) => {
      L.marker(position, {
        icon: L.divIcon({
          className: "custom-marker",
          html: "📍", // You can change this to any emoji or text
          iconSize: [30, 30], // Adjust the size
          iconAnchor: [15, 30], // Center the icon properly
        }),
      })
        .addTo(mapInstance.current as L.Map)
        .bindPopup(tooltip);
    });
  }, [markers]);

  return <div ref={mapRef} style={{ height, width: "100%" }} />;
};

export default MapComponent;
