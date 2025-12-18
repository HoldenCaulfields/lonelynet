import { useEffect } from "react";
import { useChat as useChatContext } from "@/context/chat";
import { chatAPI } from "@/services/api/chat";
import socketService from "@/services/socket/socket";

export function useChat() {
  const { rooms, setRooms, addMessage } = useChatContext();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await chatAPI.getRooms();
        setRooms(data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };

    fetchRooms();
    socketService.connect();
    socketService.onMessage(addMessage);

    return () => {
      socketService.disconnect();
    };
  }, []);

  return { rooms };
}