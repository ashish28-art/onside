import { io } from "socket.io-client";
import { getAccessToken } from "./api";

let socket = null;

export function getSocket() {
  if (socket) return socket;

  socket = io("http://localhost:4000", {
    auth: { token: getAccessToken() },
    autoConnect: false,
  });

  return socket;
}