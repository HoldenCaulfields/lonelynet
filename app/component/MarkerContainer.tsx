import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "./Icon"; //custom icon
import axios from "axios";
import { useState, useEffect } from "react";

interface MarkerData {
    _id: string;
    position: [number, number];
    text?: string;
    imageUrl?: string;
    tags?: [string];
}

export default function MarkerContainer() {
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    useEffect(() => {
        //call backend API:
        axios.get("http://localhost:5000/api/lonelyland")
            .then((res) => { setMarkers(res.data) })
            .catch((err) => console.error("Error fetching markers: ", err));
    }, []);

    return (
        <>
            {markers.map((marker) => (
                <Marker key={marker._id} position={marker.position} icon={redIcon}>
                    <Popup>
                        {marker.text}
                        {marker.imageUrl && (
                            <div className="mt-2">
                                <Image src={marker.imageUrl} width={200} height={100} alt="popup-img" />
                            </div>
                        )}
                        {marker.tags?.map((item, key) => (
                            <span
                                key={key}
                                className="inline-block px-3 py-1 mr-2 mb-2 text-xs font-bold tracking-wide uppercase bg-black text-white rounded-full shadow-md hover:bg-white hover:text-black border border-black transition-colors duration-300 cursor-pointer"
                            >
                                #{item}
                            </span>
                        ))}

                    </Popup>
                </Marker>
            ))}
            {/*<Marker position={[16.83494, 112.33855]} icon={redIcon}>
                    <Popup>Hoàng Sa (Viet Nam)</Popup>
                </Marker>

                <Marker position={[8.644541, 111.920321]} icon={redIcon}>
                    <Popup>Trường Sa (Viet Nam)</Popup>
                </Marker> */}
        </>
    );
}