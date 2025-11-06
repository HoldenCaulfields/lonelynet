import L from'leaflet';

export const redIcon = new L.Icon({
    iconUrl: "/red-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [42, 42],
    iconAnchor: [20, 50],
    shadowAnchor: [10, 50],  
    popupAnchor: [1, -42],
});

export const userIcon = new L.Icon({
    iconUrl: "/user-icon.png",
    iconSize: [62, 62],
    iconAnchor: [30, 60],
    popupAnchor: [1, -42],
    className: "user-icon-glow",
});

export const userOnline = new L.Icon({
    iconUrl: "/online.png",
    iconSize: [62, 62],
    iconAnchor: [30, 60],
    popupAnchor: [1, -42],
    className: "user-icon-glow",
});