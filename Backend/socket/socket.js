export default function initSocket(io) {
  // Store members per room (in memory)
  const roomMembers = {}; // { roomId: [ { userId, socketId } ] }

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // ────────────────────────────────────────────────
    // 🟢 JOIN ROOM
    // ────────────────────────────────────────────────
    socket.on("joinRoom", ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      socket.join(roomId);

      console.log(`📍 User ${userId} (${socket.id}) joined room ${roomId}`);

      // Initialize the room if needed
      if (!roomMembers[roomId]) roomMembers[roomId] = [];

      // Prevent duplicate entries for the same user
      const alreadyInRoom = roomMembers[roomId].some(
        (m) => m.userId === userId
      );
      if (!alreadyInRoom) {
        roomMembers[roomId].push({ userId, socketId: socket.id });
      }

      // Notify all room members (update count + list)
      io.to(roomId).emit("roomMembers", roomMembers[roomId]);
    });

    // ────────────────────────────────────────────────
    // 🔴 LEAVE ROOM (manual close)
    // ────────────────────────────────────────────────
    socket.on("leaveRoom", ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`🚪 User ${userId} (${socket.id}) left room ${roomId}`);

      if (roomMembers[roomId]) {
        roomMembers[roomId] = roomMembers[roomId].filter(
          (m) => m.socketId !== socket.id
        );
        io.to(roomId).emit("roomMembers", roomMembers[roomId]);
      }
    });

    // ────────────────────────────────────────────────
    // 💬 MESSAGE HANDLING
    // ────────────────────────────────────────────────
    socket.on("newMessage", ({ roomId, message }) => {
      if (!roomId || !message) return;
      console.log(`💬 Message sent to room ${roomId}:`, message.text);

      io.to(roomId).emit("receiveMessage", {
        ...message,
        senderSocketId: socket.id, // 👈 include sender id
      });
    });


    // ────────────────────────────────────────────────
    // ❌ DISCONNECT CLEANUP
    // ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);

      for (const roomId in roomMembers) {
        const before = roomMembers[roomId].length;
        roomMembers[roomId] = roomMembers[roomId].filter(
          (m) => m.socketId !== socket.id
        );
        const after = roomMembers[roomId].length;

        // Broadcast update if room membership changed
        if (before !== after) {
          io.to(roomId).emit("roomMembers", roomMembers[roomId]);
        }
      }
    });
  });
}
