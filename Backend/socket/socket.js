export default function initSocket(io) {
  // 🌐 GLOBAL ONLINE USERS
  const onlineUsers = {}; // { socketId: { userId, lat, lng } }

  // 🏠 ROOM MEMBERS
  const roomMembers = {}; // { roomId: [ { userId, socketId } ] }

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // ─────────────────────────────
    // 🟢 USER ONLINE (REGISTER)
    // ─────────────────────────────
    socket.on("userOnline", (userId) => {
      if (!userId) return;
      onlineUsers[socket.id] = { userId, lat: 0, lng: 0 };

      console.log(`🟢 ${userId} is now online (${socket.id})`);

      io.emit(
        "onlineUsers",
        Object.fromEntries(
          Object.entries(onlineUsers).map(([id, u]) => [
            id,
            { userId: u.userId, lat: u.lat, lng: u.lng },
          ])
        )
      );
    });

    // ─────────────────────────────
    // 📍 UPDATE LOCATION
    // ─────────────────────────────
    socket.on("update_location", (coords) => {
      if (onlineUsers[socket.id]) {
        onlineUsers[socket.id].lat = coords.lat;
        onlineUsers[socket.id].lng = coords.lng;

        // Broadcast toàn bộ danh sách (để map cập nhật)
        io.emit(
          "onlineUsers",
          Object.fromEntries(
            Object.entries(onlineUsers).map(([id, u]) => [
              id,
              { userId: u.userId, lat: u.lat, lng: u.lng },
            ])
          )
        );
      }
    });

    // ─────────────────────────────
    // 💬 JOIN ROOM
    // ─────────────────────────────
    socket.on("joinRoom", ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      socket.join(roomId);

      console.log(`📍 User ${userId} (${socket.id}) joined room ${roomId}`);

      if (!roomMembers[roomId]) roomMembers[roomId] = [];
      const alreadyInRoom = roomMembers[roomId].some((m) => m.userId === userId);
      if (!alreadyInRoom) {
        roomMembers[roomId].push({ userId, socketId: socket.id });
      }

      io.to(roomId).emit("roomMembers", roomMembers[roomId]);
    });

    // ─────────────────────────────
    // 🚪 LEAVE ROOM
    // ─────────────────────────────
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

    // ─────────────────────────────
    // 💬 NEW MESSAGE
    // ─────────────────────────────
    socket.on("newMessage", ({ roomId, message }) => {
      if (!roomId || !message) return;
      console.log(`💬 Message sent to room ${roomId}:`, message.text);

      io.to(roomId).emit("receiveMessage", {
        ...message,
        senderSocketId: socket.id,
      });
    });

    // ─────────────────────────────
    // ❌ DISCONNECT
    // ─────────────────────────────
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);

      // Xóa khỏi danh sách online
      const user = onlineUsers[socket.id];
      if (user) {
        delete onlineUsers[socket.id];
        console.log(`🔴 ${user.userId} went offline`);
        io.emit(
          "onlineUsers",
          Object.fromEntries(
            Object.entries(onlineUsers).map(([id, u]) => [
              id,
              { userId: u.userId, lat: u.lat, lng: u.lng },
            ])
          )
        );
      }

      // Xóa khỏi room
      for (const roomId in roomMembers) {
        const before = roomMembers[roomId].length;
        roomMembers[roomId] = roomMembers[roomId].filter(
          (m) => m.socketId !== socket.id
        );
        if (before !== roomMembers[roomId].length) {
          io.to(roomId).emit("roomMembers", roomMembers[roomId]);
        }
      }
    });
  });
}
