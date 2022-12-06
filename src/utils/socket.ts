import { io, Socket } from "socket.io-client";
import { ConfigEnvs } from "./constants";

const socket: Socket = io(ConfigEnvs.BACKEND_URL, {
  transports: ["websocket"],
});

export default socket;
