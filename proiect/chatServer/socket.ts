import { Server, Socket } from "socket.io";
import db from "./db";

export function setupSocketHandlers(socket: Socket, io: Server) {
  const user = (socket as any).user;
  console.log("User connected:", user.id);

  socket.on("joinChat", (chatId: number) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on("sendMessage", ({ chatId, content }) => {
    if (!content || !chatId) return;

    const stmt = db.prepare(`
      INSERT INTO messages (chat_id, sender_id, content)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(chatId, user.id, content.trim());

    const message = db.prepare("SELECT * FROM messages WHERE id = ?").get(result.lastInsertRowid);

    io.to(`chat_${chatId}`).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", user.id);
  });
}
