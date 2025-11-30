'use client';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatOverlay from './Chat';
import AnswerOverlay from './AnswerOverlay';
import { GraphNode, NodeType, GraphLink } from '@/types/types';

interface DesignSystem {
  bgStart: string;
  bgEnd: string;
  font: string;
  primaryColor: string;
  accentColor: string;
  nodeBaseColor: string;
  linkColor: string;
  particleColor: string;
  drawBackground: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void;
  drawNode: (ctx: CanvasRenderingContext2D, node: GraphNode, isSelected: boolean) => void;
  drawLink: (ctx: CanvasRenderingContext2D, source: GraphNode, target: GraphNode) => void;
}

// --- Theme Implementation Generators ---
const getTheme = (query: string): DesignSystem => {
  const q = query.toLowerCase();

  // 1. TECH THEME: Matrix/Cyberpunk (Cyan, Dark Grey, Grid)
  if (q.includes('tech') || q.includes('code') || q.includes('data')) {
    return {
      bgStart: '#050a10',
      bgEnd: '#000000',
      font: "'Orbitron', monospace",
      primaryColor: '#00f3ff',
      accentColor: '#ffffff',
      nodeBaseColor: '#0a192f',
      linkColor: 'rgba(0, 243, 255, 0.15)',
      particleColor: '#00f3ff',
      drawBackground: (ctx, w, h, time) => {
        // Moving Grid
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 60;
        const offset = (time * 0.5) % gridSize;

        ctx.beginPath();
        for (let x = offset; x < w; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = offset; y < h; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
      },
      drawNode: (ctx, node, isSelected) => {
        // Geometric Hex/Square feel
        ctx.fillStyle = node.type === NodeType.ROOT ? '#00f3ff' : '#0a192f';
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = isSelected ? 3 : 1;

        ctx.beginPath();
        if (node.type === NodeType.ROOT || node.type === NodeType.GROUP) {
          // Hexagon
          for (let i = 0; i < 6; i++) {
            const angle = 2 * Math.PI / 6 * i;
            const x = node.x + node.radius * Math.cos(angle);
            const y = node.y + node.radius * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Tech detail lines inside
          ctx.beginPath();
          ctx.moveTo(node.x - node.radius / 2, node.y);
          ctx.lineTo(node.x + node.radius / 2, node.y);
          ctx.strokeStyle = 'rgba(0,243,255,0.5)';
          ctx.stroke();
        } else {
          // Square with cut corners
          const r = node.radius;
          const cut = r * 0.3;
          ctx.beginPath();
          ctx.moveTo(node.x - r + cut, node.y - r);
          ctx.lineTo(node.x + r, node.y - r);
          ctx.lineTo(node.x + r, node.y + r - cut);
          ctx.lineTo(node.x + r - cut, node.y + r);
          ctx.lineTo(node.x - r, node.y + r);
          ctx.lineTo(node.x - r, node.y - r + cut);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      },
      drawLink: (ctx, s, t) => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        // Little data packet moving
        const time = Date.now() / 1000;
        const dist = Math.sqrt((t.x - s.x) ** 2 + (t.y - s.y) ** 2);
        const packetPos = (time * 100) % dist;
        const ratio = packetPos / dist;
        const px = s.x + (t.x - s.x) * ratio;
        const py = s.y + (t.y - s.y) * ratio;

        ctx.fillStyle = '#fff';
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    };
  }

  // 2. LOVE THEME: Passionate, Warm, Soft (Red/Burgundy/Gold)
  if (q.includes('love') || q.includes('dating') || q.includes('relationship')) {
    return {
      bgStart: '#2b0505',
      bgEnd: '#1a0000',
      font: "'Playfair Display', serif",
      primaryColor: '#ff4d6d',
      accentColor: '#ffb3c1',
      nodeBaseColor: '#590d22',
      linkColor: 'rgba(255, 77, 109, 0.2)',
      particleColor: '#c9184a',
      drawBackground: (ctx, w, h, time) => {
        // Soft Bokeh effect
        const t = time * 0.0005;
        for (let i = 0; i < 5; i++) {
          const x = (Math.sin(t + i) * 0.5 + 0.5) * w;
          const y = (Math.cos(t * 0.8 + i) * 0.5 + 0.5) * h;
          const r = 100 + Math.sin(t * 2 + i) * 50;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, 'rgba(255, 77, 109, 0.05)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      drawNode: (ctx, node, isSelected) => {
        // Soft circles with glows
        const glow = isSelected ? 20 : 10;
        ctx.shadowBlur = glow;
        ctx.shadowColor = '#ff4d6d';

        ctx.fillStyle = node.type === NodeType.ROOT ? '#ff4d6d' : '#800f2f';
        if (node.type === NodeType.ANSWER) ctx.fillStyle = '#ff758f';

        ctx.beginPath();
        // Heart-ish shape hint for Root, Circle for others
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner shine
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(node.x - node.radius / 3, node.y - node.radius / 3, node.radius / 4, 0, Math.PI * 2);
        ctx.fill();
      },
      drawLink: (ctx, s, t) => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
    };
  }

  // 3. JOB THEME: Professional, Clean, Structured (Slate/Blue/White)
  if (q.includes('job') || q.includes('work') || q.includes('career') || q.includes('find')) {
    return {
      bgStart: '#1e293b',
      bgEnd: '#0f172a',
      font: "'Inter', sans-serif",
      primaryColor: '#38bdf8',
      accentColor: '#f8fafc',
      nodeBaseColor: '#334155',
      linkColor: 'rgba(148, 163, 184, 0.3)',
      particleColor: '#cbd5e1',
      drawBackground: (ctx, w, h) => {
        // Subtle dotted grid
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x < w; x += 40) {
          for (let y = 0; y < h; y += 40) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      },
      drawNode: (ctx, node, isSelected) => {
        // Clean circles with thick strokes
        ctx.fillStyle = isSelected ? '#38bdf8' : '#1e293b';
        ctx.strokeStyle = node.type === NodeType.ROOT ? '#38bdf8' : '#94a3b8';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (node.type === NodeType.USER) {
          // Draw person icon abstraction
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(node.x, node.y - 5, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(node.x, node.y + 8, 7, Math.PI, 0);
          ctx.fill();
        }
      },
      drawLink: (ctx, s, t) => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.setLineDash([5, 5]); // Dashed lines for "connections"
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };
  }

  // 4. MOVIE THEME: Lord of the Rings / Rivendell (Ethereal Gold, Soft Green, Ancient)
  if (q.includes('movie') || q.includes('film') || q.includes('actor') || q.includes('cinema')) {
    return {
      bgStart: '#111812', // Deep Elven Green/Black
      bgEnd: '#020402',
      font: "'Cinzel', serif", // The perfect LOTR font
      primaryColor: '#fcd34d', // Soft Gold (Ring/Sun)
      accentColor: '#e2e8f0', // Mithril Silver
      nodeBaseColor: '#1c1917',
      linkColor: 'rgba(252, 211, 77, 0.15)', // Faint Gold
      particleColor: '#fcd34d',
      drawBackground: (ctx, w, h, time) => {
         // Ethereal Mist & Magic Dust
         const t = time * 0.0002;
         
         // 1. Subtle Fog Overlay (Gradients)
         const grad = ctx.createRadialGradient(w/2, h, 0, w/2, h/2, w);
         grad.addColorStop(0, 'rgba(16, 185, 129, 0.05)'); // Very faint emerald
         grad.addColorStop(1, 'transparent');
         ctx.fillStyle = grad;
         ctx.fillRect(0,0,w,h);

         // 2. Floating "Embers" or "Fireflies" (Lothlórien vibe)
         for(let i=0; i<40; i++) {
             const x = (Math.sin(t + i * 1.1) * 0.5 + 0.5) * w;
             const y = (Math.cos(t * 0.7 + i * 0.5) * 0.5 + 0.5) * h;
             const size = Math.random() * 2;
             const alpha = (Math.sin(t * 3 + i) + 1) * 0.3;
             
             ctx.beginPath();
             ctx.arc(x, y, size, 0, Math.PI * 2);
             ctx.fillStyle = `rgba(252, 211, 77, ${alpha})`; // Gold dust
             ctx.fill();
         }
      },
      drawNode: (ctx, node, isSelected) => {
        // Ancient / Jewelry aesthetic
        const isRoot = node.type === NodeType.ROOT;

        ctx.beginPath();
        // Base
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        if (isRoot) {
             // THE ONE RING Visual
             ctx.fillStyle = '#000'; // Empty void center
             ctx.fill();
             
             // Gold glow
             ctx.shadowBlur = 25;
             ctx.shadowColor = '#fcd34d';
             ctx.strokeStyle = '#fcd34d';
             ctx.lineWidth = 4;
             ctx.stroke();
             ctx.shadowBlur = 0;

             // Elvish script hint (faint inner ring)
             ctx.beginPath();
             ctx.arc(node.x, node.y, node.radius - 4, 0, Math.PI * 2);
             ctx.strokeStyle = 'rgba(252, 211, 77, 0.4)';
             ctx.lineWidth = 1;
             ctx.stroke();

        } else if (node.type === NodeType.ANSWER) {
             // PALANTIR / Crystal
             const grad = ctx.createRadialGradient(node.x - 5, node.y - 5, 2, node.x, node.y, node.radius);
             grad.addColorStop(0, '#f1f5f9'); // Reflection
             grad.addColorStop(0.3, '#64748b');
             grad.addColorStop(1, '#0f172a'); // Deep dark
             ctx.fillStyle = grad;
             ctx.fill();
             
             // Silver Rim
             ctx.strokeStyle = isSelected ? '#fcd34d' : '#94a3b8';
             ctx.lineWidth = isSelected ? 3 : 1;
             ctx.stroke();
        } else {
             // Standard Nodes: Dark stone with rune markings
             ctx.fillStyle = '#27272a'; // Zinc 800
             ctx.fill();
             
             ctx.strokeStyle = isSelected ? '#fcd34d' : '#52525b';
             ctx.lineWidth = 1.5;
             ctx.stroke();
             
             // Tiny "Rune" in center (Decorative diamond)
             ctx.fillStyle = isSelected ? '#fcd34d' : '#52525b';
             ctx.beginPath();
             ctx.moveTo(node.x, node.y - 4);
             ctx.lineTo(node.x + 3, node.y);
             ctx.lineTo(node.x, node.y + 4);
             ctx.lineTo(node.x - 3, node.y);
             ctx.fill();
        }
      },
      drawLink: (ctx, s, t) => {
        // Art Nouveau / Elven Curves (No straight lines)
        const midX = (s.x + t.x) / 2;
        const midY = (s.y + t.y) / 2 - 20 * (s.x < t.x ? 1 : -1); // Gentle arc
        
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(midX, midY, t.x, t.y);
        
        // Gradient Fade
        const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
        grad.addColorStop(0, 'rgba(252, 211, 77, 0)');
        grad.addColorStop(0.5, 'rgba(252, 211, 77, 0.3)'); // Gold center
        grad.addColorStop(1, 'rgba(252, 211, 77, 0)');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };
  }

  // 5. MUSIC THEME: Vibrant, Audio Viz (Black/Green/Pink - No purple!)
  if (q.includes('music') || q.includes('song') || q.includes('artist')) {
    return {
      bgStart: '#111',
      bgEnd: '#000',
      font: "'Space Grotesk', sans-serif",
      primaryColor: '#39ff14', // Neon Green
      accentColor: '#fff',
      nodeBaseColor: '#222',
      linkColor: 'rgba(57, 255, 20, 0.2)',
      particleColor: '#39ff14',
      drawBackground: (ctx, w, h, time) => {
        // Equalizer bars at bottom
        const bars = 50;
        const barW = w / bars;
        ctx.fillStyle = 'rgba(57, 255, 20, 0.1)';
        for (let i = 0; i < bars; i++) {
          const height = Math.sin(time * 0.005 + i * 0.5) * 100 + 100;
          ctx.fillRect(i * barW, h - height, barW - 2, height);
        }
      },
      drawNode: (ctx, node, isSelected) => {
        // Vinyl Record / Speaker look
        ctx.fillStyle = '#111';
        ctx.strokeStyle = node.type === NodeType.ROOT ? '#39ff14' : '#fff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rings
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#39ff14';
          ctx.stroke();
        }
      },
      drawLink: (ctx, s, t) => {
        // Waveform link
        ctx.beginPath();
        const midX = (s.x + t.x) / 2;
        const midY = (s.y + t.y) / 2;
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(midX + 10, midY + 10, t.x, t.y);
        ctx.stroke();
      }
    };
  }

  // DEFAULT (Fallback)
  return {
    bgStart: '#0f172a', // Deep slate blue
    bgEnd: '#020617',   // Almost black
    font: "'Space Grotesk', sans-serif",
    primaryColor: '#ffffff', // Amber/Gold for "Sparks"
    accentColor: '#38bdf8',  // Sky Blue for "Logic"
    nodeBaseColor: '#1e293b',
    linkColor: 'rgba(255, 255, 255, 0.15)',
    particleColor: '#f59e0b',
    drawBackground: (ctx, w, h, time) => {
      // Dynamic Constellation / Neural Background
      const t = time * 0.0002;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      
      // Draw floating geometric shapes
      for(let i=0; i<15; i++) {
        const x = (Math.sin(t + i) * 0.5 + 0.5) * w;
        const y = (Math.cos(t * 1.3 + i * 2) * 0.5 + 0.5) * h;
        const size = (Math.sin(t * 2 + i) + 2) * 100;
        
        ctx.beginPath();
        // Rotating triangles/shapes
        const angle = t + i;
        for(let j=0; j<3; j++) {
            const a = angle + (j * Math.PI * 2) / 3;
            const px = x + Math.cos(a) * size;
            const py = y + Math.sin(a) * size;
            j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    },
    drawNode: (ctx, node, isSelected) => {
        // Creative "Idea Bulb" look
        const isRoot = node.type === NodeType.ROOT;
        
        // Glow
        if (isSelected || isRoot) {
            const glowColor = isRoot ? '#f59e0b' : '#38bdf8';
            const grad = ctx.createRadialGradient(node.x, node.y, node.radius * 0.5, node.x, node.y, node.radius * 2.5);
            grad.addColorStop(0, glowColor);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Main Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isRoot ? '#f59e0b' : '#1e293b'; // Amber root, Dark Blue children
        ctx.fill();
        
        // Stroke
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = isRoot ? '#fff' : (node.type === NodeType.ANSWER ? '#fbbf24' : '#38bdf8');
        ctx.stroke();

        // Creative Inner Pattern (Dot in center)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(node.x, node.y, isRoot ? 4 : 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Orbiting electron for Answer nodes
        if (node.type === NodeType.ANSWER || isSelected) {
             const t = Date.now() * 0.003;
             const orbitR = node.radius + 6;
             const ox = node.x + Math.cos(t) * orbitR;
             const oy = node.y + Math.sin(t) * orbitR;
             
             ctx.beginPath();
             ctx.arc(ox, oy, 3, 0, Math.PI * 2);
             ctx.fillStyle = isRoot ? '#fff' : '#fbbf24';
             ctx.fill();
        }
    },
    drawLink: (ctx, s, t) => {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      // Gradient line
      const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.1)'); // Blue
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)'); // Amber center
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.1)'); // Blue
      ctx.strokeStyle = grad;
      ctx.stroke();
    }
  };
};

// --- Main Component ---

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, query }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsState = useRef<{ nodes: GraphNode[], links: GraphLink[] }>({
    nodes: [],
    links: []
  });
  const requestRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const dragNode = useRef<GraphNode | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [chatNode, setChatNode] = useState<GraphNode | null>(null);
  const [answerNode, setAnswerNode] = useState<GraphNode | null>(null);

  // Derive theme immediately from query
  const theme = useMemo(() => getTheme(query), [query]);

  // Physics constants
  const PHYSICS = {
    K_REPULSION: 2500,
    K_SPRING: 0.005,
    SPRING_LEN: 120,
    DAMPING: 0.90,
    CENTER_PULL: 0.003,
    DISTANCE_THRESHOLD: 400
  };

  // Socket Connection
  useEffect(() => {
    if (isOpen && query) {
      // Connect to backend
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('join_universe', query);

      socketRef.current.on('init_data', (data: { nodes: GraphNode[], links: GraphLink[] }) => {
        const { innerWidth, innerHeight } = window;
        // Seed physics state
        physicsState.current = {
          nodes: data.nodes.map(n => ({
            ...n,
            x: n.x || innerWidth / 2 + (Math.random() - 0.5) * 100,
            y: n.y || innerHeight / 2 + (Math.random() - 0.5) * 100,
            vx: n.vx || 0,
            vy: n.vy || 0,
            // Override backend radius for better visuals
            radius: n.type === NodeType.ROOT ? 30 : n.type === NodeType.ANSWER ? 25 : 15
          })),
          links: data.links
        };
      });

      socketRef.current.on('node_moved', (data: { nodeId: string, x: number, y: number }) => {
        const target = physicsState.current.nodes.find(n => n.id === data.nodeId);
        if (target && target !== dragNode.current) {
          target.x = data.x;
          target.y = data.y;
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isOpen, query]);

  // Canvas Logic
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const { nodes, links } = physicsState.current;
      const time = Date.now() - startTimeRef.current;

      // 1. Draw Background (Thematic)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, theme.bgStart);
      grad.addColorStop(1, theme.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      theme.drawBackground(ctx, width, height, time);

      // 2. Physics Engine
      nodes.forEach(node => {
        if (node === dragNode.current) return;

        let fx = 0, fy = 0;

        // Repulsion
        nodes.forEach(other => {
          if (node === other) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < PHYSICS.DISTANCE_THRESHOLD) {
            const force = PHYSICS.K_REPULSION / distSq;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        });

        // Center gravity
        fx += (width / 2 - node.x) * PHYSICS.CENTER_PULL;
        fy += (height / 2 - node.y) * PHYSICS.CENTER_PULL;

        node.vx = (node.vx + fx) * PHYSICS.DAMPING;
        node.vy = (node.vy + fy) * PHYSICS.DAMPING;
      });

      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - PHYSICS.SPRING_LEN) * PHYSICS.K_SPRING;

          if (source !== dragNode.current) {
            source.vx += (dx / dist) * force;
            source.vy += (dy / dist) * force;
          }
          if (target !== dragNode.current) {
            target.vx -= (dx / dist) * force;
            target.vy -= (dy / dist) * force;
          }
        }
      });

      nodes.forEach(node => {
        if (node !== dragNode.current) {
          node.x += node.vx;
          node.y += node.vy;
        }
        // Boundaries
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
      });

      // 3. Draw Links
      ctx.strokeStyle = theme.linkColor;
      ctx.lineWidth = 1;
      links.forEach(link => {
        const s = nodes.find(n => n.id === link.source);
        const t = nodes.find(n => n.id === link.target);
        if (s && t) theme.drawLink(ctx, s, t);
      });

      // 4. Draw Nodes
      nodes.forEach(node => {
        const isSelected = selectedNode?.id === node.id;
        theme.drawNode(ctx, node, isSelected);

        // Labels
        ctx.fillStyle = isSelected ? theme.primaryColor : theme.accentColor;
        ctx.font = `bold ${node.type === NodeType.ROOT ? 14 : 11}px ${theme.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, node.x, node.y + node.radius + 8);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isOpen, theme, selectedNode, PHYSICS]);

  // Interaction Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { nodes } = physicsState.current;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clicked = nodes.find(n => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
      return dist < n.radius + 10;
    });

    if (clicked) {
      dragNode.current = clicked;
      setSelectedNode(clicked);
      setIsDragging(true);

      if (clicked.type === NodeType.USER || clicked.type === NodeType.GROUP) {
        setChatNode(clicked);
        setAnswerNode(null);
      } else if (clicked.type === NodeType.ANSWER) {
        setAnswerNode(clicked);
        setChatNode(null);
      }
    } else {
      // Clicked background
      setSelectedNode(null);
      setChatNode(null);
      setAnswerNode(null);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragNode.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    dragNode.current.x = e.clientX - rect.left;
    dragNode.current.y = e.clientY - rect.top;
    dragNode.current.vx = 0;
    dragNode.current.vy = 0;

    if (socketRef.current) {
      socketRef.current.emit('move_node', {
        query,
        nodeId: dragNode.current.id,
        x: dragNode.current.x,
        y: dragNode.current.y
      });
    }
  }, [isDragging, query]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragNode.current = null;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1500 flex flex-col overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Header UI - styled dynamically by theme */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none flex justify-between items-start">
        <div className="pointer-events-auto">
          <h1
            className="text-6xl font-black tracking-tighter mb-2"
            style={{
              color: theme.primaryColor,
              fontFamily: theme.font,
              textShadow: `0 0 20px ${theme.linkColor}`
            }}
          >
            {query.toUpperCase()}
          </h1>
          <p className="text-white/60 text-lg" style={{ fontFamily: theme.font }}>
            Visualizing knowledge graph
          </p>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto w-12 h-12 rounded-full border flex items-center justify-center transition-all hover:rotate-90 bg-black/20 backdrop-blur-md"
          style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      {/* Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-8 right-8 max-w-sm w-full bg-black/40 backdrop-blur-xl border-l-4 border-white p-6 text-white shadow-2xl animate-[slideUp_0.3s_ease-out] pointer-events-auto"
          style={{ borderColor: selectedNode.color }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-[0.2em] opacity-60 uppercase">{selectedNode.type}</span>
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: selectedNode.color }}></div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{selectedNode.label}</h2>
          <p className="text-gray-300 leading-relaxed text-sm mb-6">{selectedNode.details}</p>

          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded font-bold text-xs uppercase tracking-wider transition-colors">
              Connect
            </button>
            <button className="flex-1 py-3 bg-white text-black hover:bg-gray-200 rounded font-bold text-xs uppercase tracking-wider transition-colors">
              Explore
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedNode && (
        <div className="absolute bottom-8 left-8 text-white/30 text-sm pointer-events-none animate-pulse">
          Drag nodes to explore. Click to inspect.
        </div>
      )}

      {/* CHAT OVERLAY */}
      {chatNode && (
        <ChatOverlay
          node={chatNode}
          onClose={() => setChatNode(null)}
        />
      )}

      {/* ANSWER OVERLAY */}
      {answerNode && (
        <AnswerOverlay
          node={answerNode}
          onClose={() => {
            setAnswerNode(null);
            setSelectedNode(null);
            dragNode.current = null;
          }}
        />
      )}

    </div>
  );
};

export default SearchModal;