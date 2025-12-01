import React, { useEffect, useRef } from 'react';
import { GolfLocation, Coordinates } from '../types';

interface MapViewProps {
  locations: GolfLocation[];
  userLocation: Coordinates | null;
}

export const MapView: React.FC<MapViewProps> = ({ locations, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Wait for Leaflet to load
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Initialize Map
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false 
      }).setView([0, 0], 13);

      // Use CartoDB Voyager tiles for a clean, Google-like look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletMapRef.current);
      
      // Add custom attribution control to bottom right
      L.control.attribution({
        position: 'bottomright'
      }).addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    // 1. Add User Location Marker
    if (userLocation) {
      const userLatLng = [userLocation.latitude, userLocation.longitude];
      
      // Create a pulsing dot effect using CSS inside a DivIcon
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; background-color: #16a34a; opacity: 0.3; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 12px; height: 12px; background-color: #16a34a; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
          </div>
          <style>
            @keyframes ping {
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const userMarker = L.marker(userLatLng, { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>You are here</b>");
        
      bounds.extend(userLatLng);
      markersRef.current.push(userMarker);
    }

    // 2. Add Golf Location Markers
    locations.forEach((loc, index) => {
      if (loc.latitude && loc.longitude) {
        const latLng = [loc.latitude, loc.longitude];
        
        // Create Numbered Pin Icon
        const pinIcon = L.divIcon({
          className: 'custom-pin-icon',
          html: `
            <div style="
              background-color: #dc2626;
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              <div style="transform: rotate(45deg); font-weight: bold; font-size: 14px; font-family: sans-serif;">${index + 1}</div>
            </div>
          `,
          iconSize: [30, 42],
          iconAnchor: [15, 42],
          popupAnchor: [0, -45]
        });

        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; min-width: 150px;">
            <div style="font-weight: 600; color: #111; margin-bottom: 4px;">${loc.name}</div>
            <div style="font-size: 12px; color: #666; display: flex; align-items: center; gap: 4px;">
              <span style="color: #ca8a04;">★</span> 
              <span>${loc.rating}</span>
              <span style="color: #ddd;">|</span>
              <span>${loc.distance}</span>
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 4px;">${loc.address?.split(',')[0]}</div>
          </div>
        `;

        const marker = L.marker(latLng, { icon: pinIcon })
          .addTo(map)
          .bindPopup(popupContent);

        bounds.extend(latLng);
        markersRef.current.push(marker);
      }
    });

    // 3. Fit Bounds
    if (Object.keys(bounds).length > 0 && !bounds.isValid()) {
      // If bounds are empty or invalid, just center on user
      if (userLocation) map.setView([userLocation.latitude, userLocation.longitude], 12);
    } else {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [locations, userLocation]);

  return (
    <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-md border border-gray-200 relative z-0">
      <div ref={mapRef} className="w-full h-full bg-gray-100" />
    </div>
  );
};