import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

const JWT_SECRET = "mysecretkey";

export function verifySocketAuth(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication token missing"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (socket as any).user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
}
