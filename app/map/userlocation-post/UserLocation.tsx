"use client";

import { useEffect } from "react";
import { Marker, Tooltip, useMap } from "react-leaflet";
import { userIcon } from "../../components/Icon";

type Latlng = { lat: number; lng: number };

type UserLocationProps = {
  targetPosition: Latlng;
  setOpenForm: (value: boolean) => void;
};

export default function UserLocation({ targetPosition, setOpenForm }: UserLocationProps) {
  const map = useMap();

  // Center map on new location whenever targetPosition changes
  useEffect(() => {
    if (targetPosition) {
      map.setView(targetPosition, 13);
    }
  }, [targetPosition, map]);

  return (
    <>
      <Marker position={targetPosition} icon={userIcon} eventHandlers={{click: () => setOpenForm(true)}}>
        <Tooltip direction="top" offset={[2, -58]} permanent>
          You are here
        </Tooltip>
      </Marker>
    </>
  );
}
