import L from'leaflet';

export const redIcon = new L.Icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export const userIcon = new L.Icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [30, 46],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});