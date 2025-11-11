"use client";
import { Marker, Popup } from "react-leaflet";
import { useMemo } from "react";
import { getTagIcon } from "../marker/Icon";

interface PatternMarkersProps {
  theme: string;
  shape: "circle" | "square" | "laptop" | "triangle";
  center: [number, number];
}

interface MarkerNode {
  name: string;
  desc?: string;
  offset: [number, number];
  icon: string;
}

export default function ThemeMarker({ theme, shape, center }: PatternMarkersProps) {
  const [lat, lng] = center;

  const markers: MarkerNode[] = useMemo(() => {
    const nodes: MarkerNode[] = [];

    // --- Hình tròn ---
    if (shape === "circle") {
      const r = 30;
      const items = [
        { name: "Vocal", icon: "mic" },
        { name: "Guitar", icon: "guitar" },
        { name: "Piano", icon: "piano" },
        { name: "Drum", icon: "drum" },
        { name: "Bass", icon: "music" },
        { name: "DJ", icon: "headphones" },
      ];
      items.forEach((it, i) => {
        const angle = (2 * Math.PI * i) / items.length;
        nodes.push({
          ...it,
          offset: [r * Math.cos(angle), r * Math.sin(angle)],
        });
      });
    }

    // --- Hình vuông ---
    else if (shape === "square") {
      const step = 5;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (Math.abs(x) === 1 || Math.abs(y) === 1) {
            nodes.push({
              name: `Node ${x},${y}`,
              icon: "square",
              offset: [x * step, y * step],
            });
          }
        }
      }
    }

    // --- Hình laptop ---
    else if (shape === "laptop") {
      const w = 50, h = 40;
      // màn hình
      for (let i = -2; i <= 2; i++) {
        nodes.push({ name: "Frontend", icon: "code", offset: [i * w * 0.2, h] });
        nodes.push({ name: "Backend", icon: "server", offset: [i * w * 0.2, h * 0.4] });
      }
      // bàn phím
      for (let i = -3; i <= 3; i++) {
        nodes.push({ name: "Python", icon: "python", offset: [i * w * 0.15, -h * 0.4] });
      }
      // touchpad
      nodes.push({ name: "JS", icon: "js", offset: [0, -h * 0.9] });
    }

    // --- Tam giác ---
    else if (shape === "triangle") {
      const size = 5;
      nodes.push({ name: "Top", icon: "arrow-up", offset: [0, size] });
      nodes.push({ name: "Left", icon: "code", offset: [-size, -size] });
      nodes.push({ name: "Right", icon: "server", offset: [size, -size] });
    }

    return nodes;
  }, [shape, theme]);

  return (
    <>
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={[lat + m.offset[1], lng + m.offset[0]]}
          icon={getTagIcon(m.icon)}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">{m.name}</h3>
              {m.desc && <p className="text-sm text-gray-600">{m.desc}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
