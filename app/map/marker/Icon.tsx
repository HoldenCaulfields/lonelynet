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
    iconUrl: "/red-icon.png",
    iconSize: [52, 52],
    iconAnchor: [30, 50],
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

// 🧩 1️⃣ Map your tags to image URLs
const tagIconMap: Record<string, string> = {
  lonely: "/icons/logo.png",
  findjob: "/icons/findjob.png",
  lover: "/icons/lover.png",
  music: "/icons/music.png",
  books: "/icons/books.png",
  movie: "/icons/movie.png",
  game: "/icons/game.png",
  sport: "/icons/sport.png",
};

// 🧩 2️⃣ Create the icon dynamically
export const getTagIcon = (tag: string) => {
  const safeTag = tagIconMap[tag] ? tag : "lonely"; // fallback if tag missing
  return new L.Icon({
    iconUrl: tagIconMap[safeTag],
    shadowUrl: "/marker-shadow.png",
    iconSize: [40, 40],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
    shadowAnchor: [10, 42],
  });
};
