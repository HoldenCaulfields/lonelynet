"use client";
import dynamic from "next/dynamic";

// Dynamically import MapComponent (disable SSR)
const Map = dynamic(() => import("./map/map"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div>
      <h1>Alice in Borderland</h1>
      <Map />
    </div>
  );
}
