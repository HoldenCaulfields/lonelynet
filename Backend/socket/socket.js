export default function initSocket(io) {
  // 🌐 ONLINE USERS: { socketId: { userId, lat, lng } }
  const onlineUsers = {};

  // 🏠 ROOM MEMBERS: { roomId: [ { userId, socketId } ] }
  const roomMembers = {};

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // ─────────────────────────────
    // 🟢 USER ONLINE
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
    // 💬 START CHAT (1 click)
    // ─────────────────────────────
    socket.on("start_chat", ({ from, to }) => {
      if (!from || !to) return;
      const roomId = [from, to].sort().join("_");

      // Người gửi join phòng
      socket.join(roomId);
      console.log(`💬 ${from} started chat with ${to} (room: ${roomId})`);

      // Gửi lời mời cho người còn lại (nếu đang online)
      const targetSocket = Object.entries(onlineUsers).find(
        ([, user]) => user.userId === to
      )?.[0];

      if (targetSocket) {
        io.to(targetSocket).emit("chat_invite", { from, roomId });
        console.log(`📨 Chat invite sent to ${to} (${targetSocket})`);
      }

      // Lưu phòng
      if (!roomMembers[roomId]) roomMembers[roomId] = [];
      const alreadyInRoom = roomMembers[roomId].some((m) => m.userId === from);
      if (!alreadyInRoom)
        roomMembers[roomId].push({ userId: from, socketId: socket.id });
    });

    // ─────────────────────────────
    // 💬 JOIN ROOM (auto or manual)
    // ─────────────────────────────
    socket.on("joinRoom", ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      socket.join(roomId);
      console.log(`📍 ${userId} joined room ${roomId}`);

      if (!roomMembers[roomId]) roomMembers[roomId] = [];
      const alreadyInRoom = roomMembers[roomId].some((m) => m.userId === userId);
      if (!alreadyInRoom)
        roomMembers[roomId].push({ userId, socketId: socket.id });

      io.to(roomId).emit("roomMembers", roomMembers[roomId]);
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
    // 🚪 LEAVE ROOM
    // ─────────────────────────────
    socket.on("leaveRoom", ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`🚪 ${userId} left room ${roomId}`);

      if (roomMembers[roomId]) {
        roomMembers[roomId] = roomMembers[roomId].filter(
          (m) => m.socketId !== socket.id
        );
        io.to(roomId).emit("roomMembers", roomMembers[roomId]);
      }
    });

    // ─────────────────────────────
    // ❌ DISCONNECT
    // ─────────────────────────────
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);

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

      // Remove from all rooms
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
