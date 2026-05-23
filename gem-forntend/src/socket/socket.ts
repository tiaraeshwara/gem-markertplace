import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io("/", {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("Socket connected"));
  socket.on("disconnect", (reason) =>
    console.log("Socket disconnected:", reason),
  );
  socket.on("connect_error", (err) =>
    console.error("Socket error:", err.message),
  );

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
