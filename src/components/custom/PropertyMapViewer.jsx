import { useState, useEffect, useRef, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
};

// Melbourne CBD center as default
const defaultCenter = {
  lat: -37.8136,
  lng: 144.9631,
};

// Region approximate boundaries for Melbourne (for visual reference)
const regionInfo = {
  EAST: { description: "Eastern suburbs: Box Hill, Ringwood, Doncaster, etc." },
  SOUTH: { description: "Southern suburbs: Brighton, St Kilda, Moorabbin, etc." },
  WEST: { description: "Western suburbs: Footscray, Sunshine, Werribee, etc." },
  NORTH: { description: "Northern suburbs: Brunswick, Preston, Coburg, etc." },
  CENTRAL: { description: "CBD and inner suburbs: Melbourne, Carlton, Fitzroy, etc." },
};

/**
 * Suggest a region based on coordinates (Melbourne-specific logic)
 * This is a simplified approximation - adjust boundaries as needed
 */
function suggestRegionFromCoordinates(coordinates) {
  const { lat, lng } = coordinates;

  // Melbourne CBD approximate center: -37.8136, 144.9631
  const cbdLat = -37.8136;
  const cbdLng = 144.9631;

  // Calculate relative position to CBD
  const latDiff = lat - cbdLat;
  const lngDiff = lng - cbdLng;

  // Central region - within ~5km of CBD
  const distanceFromCBD = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  if (distanceFromCBD < 0.05) {
    return "CENTRAL";
  }

  // Determine primary direction
  // Positive latDiff = North, Negative = South
  // Positive lngDiff = East, Negative = West

  const absLatDiff = Math.abs(latDiff);
  const absLngDiff = Math.abs(lngDiff);

  // If more north/south than east/west
  if (absLatDiff > absLngDiff * 0.7) {
    return latDiff > 0 ? "NORTH" : "SOUTH";
  }

  // If more east/west
  if (absLngDiff > absLatDiff * 0.7) {
    return lngDiff > 0 ? "EAST" : "WEST";
  }

  // Mixed - use combined logic
  if (latDiff > 0) {
    return lngDiff > 0 ? "EAST" : "NORTH"; // NE -> EAST, NW -> NORTH
  } else {
    return lngDiff > 0 ? "EAST" : "WEST"; // SE -> EAST/SOUTH, SW -> WEST
  }
}

// Check if Google Maps API is loaded
function isGoogleMapsLoaded() {
  return typeof window !== "undefined" && window.google && window.google.maps;
}

export default function PropertyMapViewer({ coordinates, address, suggestedRegion, onRegionSuggest }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Check for Google Maps availability periodically
  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds max wait

    const checkGoogleMaps = () => {
      if (isGoogleMapsLoaded()) {
        setIsReady(true);
        return;
      }
      checkCount++;
      if (checkCount < maxChecks) {
        setTimeout(checkGoogleMaps, 100);
      } else {
        setError("Google Maps not available. Please enter an address first to load the map.");
      }
    };

    checkGoogleMaps();
  }, []);

  // Initialize map when ready
  useEffect(() => {
    if (!isReady || !mapRef.current || mapInstanceRef.current) return;

    try {
      const center = coordinates
        ? { lat: coordinates.lat, lng: coordinates.lng }
        : defaultCenter;

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: coordinates ? 15 : 10,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      // Add marker if we have coordinates
      if (coordinates) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat: coordinates.lat, lng: coordinates.lng },
          map: mapInstanceRef.current,
          title: address || "Property Location",
        });
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [isReady]);

  // Update map when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (coordinates) {
      const position = { lat: coordinates.lat, lng: coordinates.lng };

      // Update map center and zoom
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(15);

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setPosition(position);
        markerRef.current.setTitle(address || "Property Location");
      } else {
        markerRef.current = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: address || "Property Location",
        });
      }
    } else {
      // No coordinates - reset to default and remove marker
      mapInstanceRef.current.setCenter(defaultCenter);
      mapInstanceRef.current.setZoom(10);

      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    }
  }, [coordinates, address]);

  // Suggest region based on coordinates
  useEffect(() => {
    if (coordinates && onRegionSuggest) {
      const region = suggestRegionFromCoordinates(coordinates);
      if (region) {
        onRegionSuggest(region);
      }
    }
  }, [coordinates, onRegionSuggest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 text-sm">
        {error}
      </div>
    );
  }

  if (!isReady) {
    return (
      <Box className="flex justify-center items-center h-40 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <CircularProgress size={24} />
          <p className="text-sm text-gray-500 mt-2">Loading map...</p>
        </div>
      </Box>
    );
  }

  return (
    <div className="space-y-3">
      <div ref={mapRef} style={containerStyle} className="border border-gray-200" />

      {/* Region suggestion info */}
      {suggestedRegion && regionInfo[suggestedRegion] && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Suggested Region: {suggestedRegion}</span>
          </div>
          <p className="text-blue-600 text-xs mt-1">
            {regionInfo[suggestedRegion].description}
          </p>
        </div>
      )}

      {!coordinates && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
          Enter an address above to see its location on the map
        </div>
      )}
    </div>
  );
}
