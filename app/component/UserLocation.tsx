import { useState } from "react";
import { Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
import { userIcon } from "./Icon";
import PostForm from "./PostForm";

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
                <Tooltip direction="top" offset={[2, -38]} permanent>
                    You are here
                </Tooltip>

                <Popup>
                    <div className="w-64 md:w-80">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            ✏️ Someone out there will find you
                        </h3>
                        <PostForm address={position} />
                    </div>
                </Popup>
            </Marker>


        </>
    );
}