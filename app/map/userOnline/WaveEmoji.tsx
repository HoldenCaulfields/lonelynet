export default function WaveEmoji({ color = "cyan" }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className={`absolute w-10 h-10 rounded-full border-4 border-${color}-300 animate-ripple`} />
      <span className={`absolute w-10 h-10 rounded-full border-4 border-${color}-400 animate-ripple-delay`} />
      <span className={`absolute w-10 h-10 rounded-full border-4 border-${color}-200 animate-ripple-slow`} />
      <span className="relative text-3xl animate-hand-floating drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]">
        👋
      </span>
    </div>
  );
}
