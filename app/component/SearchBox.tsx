

export default function SearchBox() {
  return (
    
      <div className="flex items-center w-full max-w-md bg-amber-400 rounded-full border border-gray-300 px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
        
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 outline-none bg-transparent text-gray-800"
        />
        <span className="mr-2 text-gray-500">🔍</span>
      </div>
  );
}
