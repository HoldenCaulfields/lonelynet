import { useState } from "react";
import { Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
import { userIcon } from "./Icon";

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
    });

    return position === null ? null : (
        <>
            <Marker position={position} icon={userIcon}>
                <Tooltip direction="top" offset={[2, -38]} permanent >
                    You are here
                </Tooltip>
                <Popup>
                    {/* //add input, image here */}
                    <input type="text" className="border-amber-200" />
                    <button type="submit" >Send</button>
                </Popup>
            </Marker>
            
        </>
    );
}