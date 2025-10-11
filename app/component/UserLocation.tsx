import { Marker, Popup } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

export default function UserLocation(props: { icon: L.Icon }) {
    const [position, setPosition] = useState<[number, number]>([0, 0]);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            setPosition([position.coords.latitude, position.coords.longitude]);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    return (
        <Marker position={[position[0], position[1]]} icon={props.icon}>
            <Popup>Xin chào </Popup>
        </Marker>
    );
}
