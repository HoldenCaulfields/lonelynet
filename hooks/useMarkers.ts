import { useEffect } from "react";
import { useMap } from "@/context/Map";
import { postsAPI } from "@/services/api/posts";

export function useMarkers() {
  const { markers, setMarkers, setLoading, setError } = useMap();

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        setLoading(true);
        const data = await postsAPI.getAll();
        setMarkers(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching markers");
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  return { markers };
}