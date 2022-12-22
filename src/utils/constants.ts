const IS_DEV = true;
export const ConfigEnvs = {
  BACKEND_URL: IS_DEV ? "http://localhost:80" : "",
};

export const ApiRoutes = {
  register: () => "/api/user/register",
  login: () => "/api/user/login",
  self: () => "/api/user/self",
  getUser: (userId: string) => `/api/user/${userId}`,
  getChats: (to: string) => `/api/chat/${to}`,
  saveChat: () => "/api/chat",
  getInbox: () => "/api/chat/inbox",
  decodeFile: () => "/api/chat/decode",
};

export const SocketActions = {
  connection: "connection",
  disconnect: "disconnect",
  ADD_USER: "ADD_USER",
  IS_USER_ONLINE: "IS_USER_ONLINE",
  SEND_MSG: "SEND_MSG",
  RECEIVE_MSG: "RECEIVE_MSG",
  ERROR: "ERR",
  GET_ONLINE_USERS: "GET_ONLINE_USERS",
  ONLINE_USERS: "ONLINE_USERS",
};

export function isImageURL(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}
