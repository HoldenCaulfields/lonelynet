import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "./Icon"; //custom icon

export default function MarkerContainer() {
    return (
        <>
            <Marker position={[10.7769, 106.7009]} icon={redIcon}>
                <Popup>Xin chào từ TP. Hồ Chí Minh 🇻🇳
                    <Image width={200} height={100} src="/meo.jpg" alt="icon" />
                </Popup>
            </Marker>

            <Marker position={[21.0245, 105.841]} icon={redIcon}>
                <Popup>Xin chào từ Hà Nội 🇻🇳</Popup>
            </Marker>

            {/* <Marker position={[16.83494, 112.33855]} icon={redIcon}>
                    <Popup>Hoàng Sa (Viet Nam)</Popup>
                </Marker>

                <Marker position={[8.644541, 111.920321]} icon={redIcon}>
                    <Popup>Trường Sa (Viet Nam)</Popup>
                </Marker> */}
        </>
    );
}