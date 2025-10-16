"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

interface Props {
  markers: { position: [number, number] }[];
}

export default function MarkerMapController({ markers }: Props) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = markers.map((m) => m.position);
      map.fitBounds(bounds as any);
    }
  }, [markers, map]);

  return null;
}
