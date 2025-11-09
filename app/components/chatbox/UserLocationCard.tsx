"use client";

import { useEffect, useState } from "react";
import { MapPin, Users, Briefcase } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  country?: string;
}

interface SoulsStats {
  nearbyCount: number;
  jobSeekers: number;
}

export default function UserLocationCard() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [stats, setStats] = useState<SoulsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const locationData: Location = {
            lat: latitude,
            lng: longitude,
          };

          // 2️⃣ Fetch country from reverse geocoding (OpenCage or Nominatim)
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            locationData.country = data.address?.country || "Unknown";
          } catch (_err) {
            locationData.country = "Unknown";
          }

          setUserLocation(locationData);

          // 3️⃣ Fetch stats from your API
          try {
            const res = await fetch("https://lonelynet.onrender.com/api/lonelyland");
            const apiData = await res.json();

            // Example: You can adjust logic here to compute counts from API data
            const nearbyCount = apiData.length || 100; // fallback demo
            const jobSeekers = apiData.filter((s: any) => s.type === "findjob").length || 100;

            setStats({ nearbyCount, jobSeekers });
          } catch (error) {
            console.error("Error fetching souls:", error);
          }

          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  if (loading)
    return (
      <div className="p-4 rounded-2xl shadow-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md border border-gray-200 text-gray-500 animate-pulse">
        Loading your location...
      </div>
    );

  if (!userLocation)
    return (
      <div className="p-4 rounded-2xl shadow-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md border border-gray-200 text-gray-700">
        Could not get your location.
      </div>
    );

  return (
    <div className="p-4 rounded-2xl shadow-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md border border-gray-200">
      <h3 className="font-bold text-lg mb-2 text-gray-800 flex items-center gap-2">
        <MapPin size={20} className="text-orange-500" /> Your Location
      </h3>

      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">Lat:</span> {userLocation.lat.toFixed(4)}{" "}
        <span className="font-semibold">Lng:</span> {userLocation.lng.toFixed(4)}
      </p>
      <p className="text-gray-700 text-sm mb-4">
        <span className="font-semibold">Country:</span> {userLocation.country}
      </p>

      {stats && (
        <div className="space-y-1 text-gray-700 text-sm">
          <p className="flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> There are{" "}
            <span className="font-semibold">{stats.nearbyCount}</span> users near you
          </p>
          <p className="flex items-center gap-2">
            <Briefcase size={18} className="text-green-500" />{" "}
            <span className="font-semibold">{stats.jobSeekers}</span> users are finding jobs here
          </p>
        </div>
      )}
    </div>
  );
}
