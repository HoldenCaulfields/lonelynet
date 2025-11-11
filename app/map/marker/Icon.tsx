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

export const otherIcon = new L.Icon({
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
/* export const getTagIcon = (tag: string) => {
  const safeTag = tagIconMap[tag] ? tag : "lonely"; // fallback if tag missing
  return new L.Icon({
    iconUrl: tagIconMap[safeTag],
    shadowUrl: "/marker-shadow.png",
    iconSize: [40, 40],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
    shadowAnchor: [10, 42],
  });
}; */

export const getTagIcon = (tagOrIcon?: string) => {
  if (!tagOrIcon) tagOrIcon = "lonely";

  // Nếu là emoji (1 ký tự Unicode), tạo icon dạng text
  const isEmoji =
    typeof tagOrIcon === "string" &&
    tagOrIcon.length <= 3 && // emoji thường ngắn
    !tagOrIcon.includes("/"); // loại trừ URL

  if (isEmoji) {
    return L.divIcon({
      html: `<div style="
        font-size: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: transparent;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      ">${tagOrIcon}</div>`,
      className: "emoji-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35],
    });
  }

  // Nếu là tag bình thường, fallback sang tagIconMap như cũ
  const safeTag = tagIconMap[tagOrIcon] ? tagOrIcon : "lonely";
  return new L.Icon({
    iconUrl: tagIconMap[safeTag],
    shadowUrl: "/marker-shadow.png",
    iconSize: [40, 40],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
    shadowAnchor: [10, 42],
  });
};
