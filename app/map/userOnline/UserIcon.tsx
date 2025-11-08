// app/map/userOnline/UserIcon.tsx
import L from "leaflet";

export const userIcon = (isSelf: boolean, isWaving: boolean, color = "cyan") =>
  L.divIcon({
    className: "leaflet-react-icon",
    html: `
      <div class="relative flex flex-col items-center react-marker">
        <div class="relative">
          <div class="${
            isSelf
              ? `w-6 h-6 bg-${color}-500 ring-4 ring-${color}-300 shadow-md`
              : `w-4 h-4 bg-${color}-500 ring-2 ring-${color}-200`
          } rounded-full"></div>
        </div>
        <span class="absolute -bottom-5 text-xs text-black font-semibold bg-white/70 rounded-md px-1">
          ${isSelf ? "Me" : "Online"}
        </span>
      </div>
    `,
    iconAnchor: [12, 24],
    popupAnchor: [0, -10],
  });
