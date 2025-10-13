import { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { redIcon } from "./Icon";

type Latlng = {
    lat: number;
    lng: number;
};

export default function UserLocation() {
    const [position, setPosition] = useState<Latlng | null>(null);
    const map = useMapEvents({
        click() {
            map.locate();
        },
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    })
    return position === null ? null : (
        <>
            <Marker position={position} icon={redIcon}>
                <Popup>You are here</Popup>
            </Marker>
        </>
    );
}