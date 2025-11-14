export default function initSocket(io) {
  // 🌐 ONLINE USERS: { socketId: { userId, lat, lng, musicUrl, mood, userStatus, status } }
  const onlineUsers = {};

  // 🏠 ROOM MEMBERS: { roomId: [ { userId, socketId } ] }
  const roomMembers = {};

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // 🟢 USER ONLINE
    socket.on("userOnline", (userId) => {
      if (!userId) return;
      
      // Initialize user with all fields
      onlineUsers[socket.id] = { 
        userId, 
        lat: 0, 
        lng: 0, 
        musicUrl: null,
        mood: null,
        userStatus: null,
        status: "online"
      };
      
      console.log(`🟢 ${userId} is now online (${socket.id})`);

      // Broadcast updated user list to ALL clients
      io.emit("onlineUsers", onlineUsers);
    });

    // 👋 WAVE
    socket.on("wave", ({ from, lat, lng }) => {
      console.log("👋 Wave from:", from);
      io.emit("wave_signal", { from, lat, lng });
    });

    // 🎵 UPDATE MUSIC
    socket.on("update_music", ({ userId, musicUrl }) => {
      const user = onlineUsers[socket.id];
      if (!user) {
        console.log(`⚠️ User not found for socket ${socket.id}`);
        return;
      }

      user.musicUrl = musicUrl;
      console.log(`🎵 ${userId} is now playing: ${musicUrl}`);
      
      // Broadcast updated user list
      io.emit("onlineUsers", onlineUsers);
    });

    // 😊 UPDATE MOOD
    socket.on("update_mood", ({ userId, mood }) => {
      const user = onlineUsers[socket.id];
      if (!user) {
        console.log(`⚠️ User not found for socket ${socket.id}`);
        return;
      }
      
      user.mood = mood;
      console.log(`😊 ${userId} mood: ${mood}`);
      
      // Broadcast updated user list
      io.emit("onlineUsers", onlineUsers);
    });

    // 🎯 UPDATE STATUS
    socket.on("update_status", ({ userId, userStatus }) => {
      const user = onlineUsers[socket.id];
      if (!user) {
        console.log(`⚠️ User not found for socket ${socket.id}`);
        return;
      }
      
      user.userStatus = userStatus;
      console.log(`🎯 ${userId} status: ${userStatus}`);
      
      // Broadcast updated user list
      io.emit("onlineUsers", onlineUsers);
    });

    // 📍 UPDATE LOCATION
    socket.on("update_location", (coords) => {
      if (onlineUsers[socket.id]) {
        onlineUsers[socket.id].lat = coords.lat;
        onlineUsers[socket.id].lng = coords.lng;

        // Broadcast updated user list
        io.emit("onlineUsers", onlineUsers);
      }
    });

    // 💫 SEND REACTION
    socket.on("send_reaction", ({ from, to, reaction, timestamp }) => {
      console.log(`💫 Reaction from ${from} to ${to}: ${reaction}`);
      
      // Tìm socket của người nhận dựa trên userId
      const targetSocketId = Object.entries(onlineUsers).find(
        ([socketId, user]) => user.userId === to
      )?.[0];
      
      if (targetSocketId) {
        io.to(targetSocketId).emit("receive_reaction", {
          from,
          reaction,
          timestamp
        });
        console.log(`✅ Reaction delivered to ${to} (socket: ${targetSocketId})`);
      } else {
        console.log(`⚠️ Target user ${to} not found online`);
      }
    });

    // 💬 START CHAT (1 click)
    socket.on("start_chat", ({ from, to }) => {
      if (!from || !to) return;
      const roomId = [from, to].sort().join("_");

      socket.join(roomId);
      console.log(`💬 ${from} started chat with ${to} (room: ${roomId})`);

      // Tìm socket của người nhận
      const targetSocketId = Object.entries(onlineUsers).find(
        ([socketId, user]) => user.userId === to
      )?.[0];

      if (targetSocketId) {
        io.to(targetSocketId).emit("chat_invite", { from, roomId });
        console.log(`📨 Chat invite sent to ${to} (${targetSocketId})`);
      }

      // Lưu phòng
      if (!roomMembers[roomId]) roomMembers[roomId] = [];
      const alreadyInRoom = roomMembers[roomId].some((m) => m.userId === from);
      if (!alreadyInRoom) {
        roomMembers[roomId].push({ userId: from, socketId: socket.id });
      }
    });

    // 💬 JOIN ROOM
    socket.on("joinRoom", ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      socket.join(roomId);
      console.log(`📍 ${userId} joined room ${roomId}`);

      if (!roomMembers[roomId]) roomMembers[roomId] = [];
      const alreadyInRoom = roomMembers[roomId].some((m) => m.userId === userId);
      if (!alreadyInRoom) {
        roomMembers[roomId].push({ userId, socketId: socket.id });
      }

      io.to(roomId).emit("roomMembers", roomMembers[roomId]);
    });

    // 💬 NEW MESSAGE
    socket.on("newMessage", ({ roomId, message }) => {
      if (!roomId || !message) return;
      console.log(`💬 Message sent to room ${roomId}:`, message.text);

      io.to(roomId).emit("receiveMessage", {
        ...message,
        senderSocketId: socket.id,
      });
    });

    // 🚪 LEAVE ROOM
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

    // ❌ DISCONNECT
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);

      const user = onlineUsers[socket.id];
      if (user) {
        console.log(`🔴 ${user.userId} went offline`);
        delete onlineUsers[socket.id];
        
        // Broadcast updated user list
        io.emit("onlineUsers", onlineUsers);
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