import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket || !socket.connected) {
    socket = io("http://localhost:8080", {
      auth: {
        token: localStorage.getItem("token"), // pass JWT if needed
      },
      transports: ["websocket"], // force WebSocket (optional)
    });
  }

  return socket;
};
