import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { verify } from "jsonwebtoken";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import dotenv from "dotenv";
import e from "express";

dotenv.config();

interface SocketUser {
  id: string;
  name: string;
  avatar?: string;
}

interface TypingPayload {
  conversation_id: string;
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

export class RealtimeService {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
          return next(new Error("Authentication error: Token required"));
        }

        const secret =
          env.JWT_SECRET ||
          "887c8d4b4e3acac72f9a55318bed9e6d1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p";
        const decoded = verify(token, secret) as unknown as SocketUser;
        // ...
        socket.data.user = decoded;
        next();
      } catch (error) {
        logger.error("Socket authentication error:", error);
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      const user = socket.data.user as SocketUser;
      logger.info(`User connected: ${user.id} (${socket.id})`);

      // Track user socket connections
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)?.add(socket.id);

      // Join user's personal room
      socket.join(`user:${user.id}`);

      // Join conversation room
      socket.on("join_conversation", (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${user.id} joined conversation: ${conversationId}`);
      });

      // Leave conversation room
      socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        logger.info(`User ${user.id} left conversation: ${conversationId}`);
      });

      // Typing indicator
      socket.on("typing", (payload: TypingPayload) => {
        const { conversation_id, is_typing } = payload;

        // Broadcast to others in the conversation (except sender)
        socket.to(`conversation:${conversation_id}`).emit("user_typing", {
          conversation_id,
          user_id: user.id,
          user_name: user.name,
          is_typing,
        });

        // Auto-clear typing after 3 seconds
        if (is_typing) {
          setTimeout(() => {
            socket.to(`conversation:${conversation_id}`).emit("user_typing", {
              conversation_id,
              user_id: user.id,
              user_name: user.name,
              is_typing: false,
            });
          }, 3000);
        }
      });

      // Disconnect
      socket.on("disconnect", () => {
        logger.info(`User disconnected: ${user.id} (${socket.id})`);

        // Remove socket from user's connections
        const userSocketSet = this.userSockets.get(user.id);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(user.id);
          }
        }
      });

      // Error handling
      socket.on("error", (error) => {
        logger.error(`Socket error for user ${user.id}:`, error);
      });
    });
  }

  // Emit new message to conversation participants
  public emitNewMessage(conversationId: string, message: any): void {
    this.io.to(`conversation:${conversationId}`).emit("new_message", message);
    logger.info(`New message emitted to conversation: ${conversationId}`);
  }

  // Emit message update (e.g., read status)
  public emitMessageUpdate(conversationId: string, message: any): void {
    this.io
      .to(`conversation:${conversationId}`)
      .emit("message_updated", message);
  }

  // Emit conversation update
  public emitConversationUpdate(userId: string, conversation: any): void {
    this.io.to(`user:${userId}`).emit("conversation_updated", conversation);
  }

  // Notify user about new message in conversation
  public notifyNewMessage(userId: string, notification: any): void {
    this.io.to(`user:${userId}`).emit("new_message_notification", notification);
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return (
      this.userSockets.has(userId) &&
      (this.userSockets.get(userId)?.size || 0) > 0
    );
  }

  // Get online users count
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Broadcast to all connected clients
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // Get Socket.IO instance
  public getIO(): SocketIOServer {
    return this.io;
  }
}
