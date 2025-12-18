"use client";
import dynamic from "next/dynamic";

// Dynamically import MapComponent (disable SSR)
const Map = dynamic(() => import("@/map/Map"), {
  ssr: false,
});

export default function HomePage() {

  return (
        <Map />
  );
}
