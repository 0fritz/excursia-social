import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import { verifySocketAuth } from "./auth";
import { setupSocketHandlers } from "./socket";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use(verifySocketAuth);

io.on("connection", (socket) => {
  setupSocketHandlers(socket, io);
});

server.listen(4000, () => {
  console.log("Chat server running on http://localhost:4000");
});
