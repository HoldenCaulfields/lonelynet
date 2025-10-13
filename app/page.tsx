"use client";
import dynamic from "next/dynamic";
import Navbar from "./component/NavBar";

// Dynamically import MapComponent (disable SSR)
const Map = dynamic(() => import("./map/Map"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="sticky top-0 z-10">
        
      </div>

      <Navbar />

      <div className="flex-1">
        <Map />
      </div>
    </div>
  );
}
