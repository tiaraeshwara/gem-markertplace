import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { chatService } from "../modules/chat/chat.service";

interface AuthSocket extends Socket {
  userId?: string;
}

export const setupSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    const userId = socket.userId!;
    console.log(`Socket connected: ${userId}`);

    // Join personal notification room
    socket.join(`user:${userId}`);

    // Join a chat room
    socket.on("join_room", async ({ roomId }: { roomId: string }) => {
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId);
      if (!hasAccess) {
        socket.emit("error", { message: "Access denied to this room" });
        return;
      }
      socket.join(`room:${roomId}`);
      socket.emit("room_joined", { roomId });
    });

    // Send a message
    socket.on(
      "send_message",
      async ({ roomId, content }: { roomId: string; content: string }) => {
        try {
          if (!content || content.trim() === "") return;

          const message = await chatService.sendMessage(
            roomId,
            userId,
            content.trim(),
          );

          // Broadcast to all room members
          io.to(`room:${roomId}`).emit("message", message);
        } catch (err: unknown) {
          socket.emit("error", {
            message:
              err instanceof Error ? err.message : "Failed to send message",
          });
        }
      },
    );

    // Typing indicators
    socket.on("typing", ({ roomId }: { roomId: string }) => {
      socket.to(`room:${roomId}`).emit("typing", { userId });
    });

    socket.on("stop_typing", ({ roomId }: { roomId: string }) => {
      socket.to(`room:${roomId}`).emit("stop_typing", { userId });
    });

    // Read receipt
    socket.on("read_receipt", ({ roomId }: { roomId: string }) => {
      socket.to(`room:${roomId}`).emit("read_receipt", { userId, roomId });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${userId}`);
    });
  });
};
