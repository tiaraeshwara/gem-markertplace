import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { config } from "./config";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { setupSocket } from "./socket/socket.handler";
import { setSocketServer } from "./services/notification.service";

import authRoutes from "./modules/auth/auth.routes";
import gemsRoutes from "./modules/gems/gems.routes";
import reservationsRoutes from "./modules/reservations/reservations.routes";
import valuationsRoutes from "./modules/valuations/valuations.routes";
import chatRoutes from "./modules/chat/chat.routes";
import adminRoutes from "./modules/admin/admin.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocket(io);
setSocketServer(io);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// General middleware
app.use(compression());
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/gems", gemsRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api", valuationsRoutes); // Mounts /api/gems/:gemId/valuations and /api/valuations/*
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 GemVault API running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

export default app;
