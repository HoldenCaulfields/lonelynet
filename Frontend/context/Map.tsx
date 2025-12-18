"use client";

import React, { createContext, useContext, useState } from "react";
import { PostMarker } from "@/types/types";

interface MapContextType {
  markers: PostMarker[];
  selectedMarker: PostMarker | null;
  userLocation: { latitude: number; longitude: number } | null;
  loading: boolean;
  error: string | null;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;

  setMarkers: (markers: PostMarker[]) => void;
  setSelectedMarker: (marker: PostMarker | null) => void;
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  addMarker: (marker: PostMarker) => void;
  updateMarker: (id: string, marker: Partial<PostMarker>) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [markers, setMarkers] = useState<PostMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<PostMarker | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // ✅ ADD THESE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMarker = (marker: PostMarker) => {
    setMarkers(prev => [...prev, marker]);
  };

  const updateMarker = (id: string, updates: Partial<PostMarker>) => {
    setMarkers(prev =>
      prev.map(m => (m._id === id ? { ...m, ...updates } : m))
    );
  };

  return (
    <MapContext.Provider
      value={{
        markers,
        selectedMarker,
        userLocation,
        loading,
        error,
        setLoading,
        setError,
        setMarkers,
        setSelectedMarker,
        setUserLocation,
        addMarker,
        updateMarker,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within MapProvider");
  }
  return context;
}
