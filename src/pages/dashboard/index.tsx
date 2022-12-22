import {
  ChangeEvent,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import socket from "../../utils/socket";
import { ApiRoutes, isImageURL, SocketActions } from "../../utils/constants";
import { useCookies } from "react-cookie";
import { removeUser, User } from "../../redux/slices/user";
import Message, { MessageProps } from "../../components/message";
import { AxiosResponse } from "axios";
import networkFetch from "../../utils/axios";
import { toast } from "react-toastify";

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const [{ jwt }, , removeCookie] = useCookies<
    "jwt",
    {
      jwt: string;
    }
  >(["jwt"]);
  const [onlineUsers, setOnlineUsers] = useState<Array<User>>([]);
  const { user } = useSelector((state: RootState) => state);
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const [msgs, setMsgs] = useState<Array<MessageProps>>([]);
  const [msg, setMsg] = useState<any>("");
  const [embedData, setEmbedData] = useState<string>("");
  const [currUser, setCurrUser] = useState<User>();
  const [imgPreview, setImgPreview] = useState<any>(null);

  const [conType, setConType] = useState("TEXT");

  const fileInputRef = useRef<any>();

  const [inbox, setInbox] =
    useState<
      Array<{ userId: string; lastMessage: string; timestamp: string }>
    >();

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | any>
  ) => {
    if (e.target.type === "radio") setConType(e.target.value);
    else {
      if (e.target.type === "file") {
        setMsg(e.target.files[0]);
        const tempURI = URL.createObjectURL(e.target.files[0]);
        setImgPreview(tempURI);
      } else if (e.target.name === "embedData") setEmbedData(e.target.value);
      else setMsg(e.target.value);
    }
  };

  useEffect(() => {
    if (!user.userId) navigate("/signup");
  }, [user]);

  useEffect(() => {
    if (user.userId) {
      socket.emit(SocketActions.GET_ONLINE_USERS, user.userId);
      socket.on(SocketActions.ONLINE_USERS, (usersOnline: Array<User>) => {
        setOnlineUsers(usersOnline);
      });
    }
  }, []);

  const handleSendMsg = async () => {
    if (user.userId) {
      networkFetch.defaults.headers.common["x-access-token"] = jwt;
      try {
        if (currUser?.userId) {
          let finalReqBody;
          if (conType === "IMAGE") {
            finalReqBody = new FormData();
            finalReqBody.append("content", msg);
            finalReqBody.append("to", currUser.userId);
            finalReqBody.append("contentType", conType);
            if (embedData.trim().length)
              finalReqBody.append("embedData", embedData);
          } else {
            finalReqBody = {
              content: msg,
              to: currUser?.userId,
              contentType: conType,
            };
          }
          const res: AxiosResponse<MessageProps> = await networkFetch.post(
            ApiRoutes.saveChat(),
            finalReqBody
          );

          socket.emit("SEND_MSG", { to: currUser?.userId, chatDoc: res.data });
          setMsgs((m) => [
            {
              content: res.data.content || "",
              to: currUser?.userId || "",
              from: user?.userId || "",
              contentType: conType,
              isEncrypted: res.data.isEncrypted || false,
            },
            ...m,
          ]);
          setMsg("");
          fileInputRef.current.value = "";
          setImgPreview(null);
        } else {
          toast("Select a user.");
        }
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    socket.on("RECEIVE_MSG", (message) => {
      setMsgs((m) => [message, ...m]);
    });
  }, []);

  const fetchMessages = async () => {
    if (user.userId) {
      networkFetch.defaults.headers.common["x-access-token"] = jwt;
      try {
        if (currUser?.userId) {
          const res: AxiosResponse<Array<MessageProps>> =
            await networkFetch.get(ApiRoutes.getChats(currUser?.userId));
          setMsgs(res.data);
        }
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    setMsg("");
    setConType("TEXT");
  }, [currUser]);

  const fetchInbox = async () => {
    if (user.userId) {
      networkFetch.defaults.headers.common["x-access-token"] = jwt;
      try {
        const res: AxiosResponse<any> = await networkFetch.get(
          ApiRoutes.getInbox()
        );

        const inbox_res = Object.keys(res.data).map((key: string) => ({
          ...res.data[key],
          userId: key,
          timestamp:
            new Date(res.data[key].timestamp).toDateString() +
            " " +
            new Date(res.data[key].timestamp).toLocaleTimeString(),
        }));

        setInbox(inbox_res);
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchCurrUser = async (val: {
    userId: string;
    lastMessage: string;
    timestamp: string;
  }) => {
    networkFetch.defaults.headers.common["x-access-token"] = jwt;
    try {
      const res: AxiosResponse<User> = await networkFetch.get(
        ApiRoutes.getUser(val.userId)
      );
      setCurrUser(res.data);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (inbox?.length) fetchCurrUser(inbox[0]);
  }, [inbox]);

  return (
    <>
      {imgPreview && (
        <div className="w-screen h-screen fixed top-0 left-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="min-w-[600px] bg-white rounded-md">
            <div className="max-w-full h-96 p-2">
              <img className="w-full h-full" src={imgPreview} alt="img" />
            </div>
            <div className="w-full h-1/2 p-2 flex gap-2">
              <textarea
                onChange={handleChange}
                placeholder="Type a secret message to embed."
                className="w-full h-full rounded-md p-1 px-2 bg-transparent border border-black"
                name="embedData"
                id="embedData"
                value={embedData}
              />
              <button
                onClick={handleSendMsg}
                className="text-black px-3 border border-black rounded-md hover:text-white hover:bg-black"
              >
                Send
              </button>
            </div>
            <div className="w-full flex justify-center items-center p-2">
              <button
                onClick={() => {
                  setImgPreview(null);
                  setEmbedData("");
                  fileInputRef.current.value = "";
                }}
                className="border-red-500 text-red-500 font-bold py-1 px-3 border-2 rounded-md hover:bg-red-500 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full h-screen flex md:flex-row flex-col">
        <div
          onClick={() => {
            removeCookie("jwt");
            dispatch(removeUser(null));
          }}
          className="text-white px-2 border rounded-sm hover:bg-white hover:text-black fixed top-0 left-0 m-3 cursor-pointer"
        >
          Logout
        </div>
        <div className="w-1/4 h-full pl-10 pr-5 py-36">
          <div className="w-full h-full border rounded-xl">
            <div className="text-white text-center py-3">Online Members</div>
            <div className="w-full">
              {onlineUsers.map((u) => {
                return (
                  <div
                    onClick={() =>
                      setCurrUser(
                        onlineUsers.filter((t) => u.userId === t.userId)[0]
                      )
                    }
                    key={u.userId}
                    className="text-white w-full cursor-pointer hover:bg-gray-600 p-2 flex items-center gap-2"
                  >
                    <span className="bg-green-500 w-2 h-2 rounded-full"></span>
                    <div>
                      <img width={30} src={u.avatar} alt="pic" />
                    </div>
                    <div>
                      {u.name}
                      {u.userId === user.userId ? " (Me)" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="w-3/4 h-full pr-10 pl-5 py-20">
          <div className="w-full h-full border rounded-xl flex">
            <div className="w-1/3 border-r h-full">
              <div className="text-white text-center py-3">Direct Messages</div>
              <div className="overflow-y-auto w-full">
                {inbox?.map((val, idx) => {
                  return (
                    <div
                      key={val.timestamp + idx}
                      onClick={() => fetchCurrUser(val)}
                      className={`w-full h-16 px-5 flex text-white justify-center items-center hover:cursor-pointer hover:bg-slate-800 ${
                        currUser?.userId == val.userId ? "bg-slate-800" : ""
                      }`}
                    >
                      <div className="w-2/3 text-sm">
                        <div className="font-bold">{val.userId}</div>
                        <div className="text-gray-400">
                          {isImageURL(val.lastMessage)
                            ? "Image"
                            : val.lastMessage.length > 15
                            ? val.lastMessage.slice(0, 15) + "..."
                            : val.lastMessage}
                        </div>
                      </div>
                      <div className="w-1/3 text-xs">{val.timestamp}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="w-2/3 h-full">
              <div className="w-full h-1/6 bg-slate-600 border-b text-white rounded-tr-xl flex justify-center items-center gap-3">
                {currUser && (
                  <div>
                    <img
                      className="w-20 h-20 rounded-full"
                      src={currUser?.avatar}
                      alt="prof"
                    />
                  </div>
                )}
                <div className="text-2xl font-semibold">{currUser?.name}</div>
              </div>
              <div className="w-full h-2/3 flex flex-col-reverse overflow-y-auto">
                {currUser &&
                  msgs.map((val, idx) => {
                    return (
                      <Message
                        key={idx}
                        content={val.content}
                        contentType={val.contentType}
                        to={val.to}
                        from={val.from}
                        isEncrypted={val.isEncrypted}
                      />
                    );
                  })}
              </div>
              <div className="w-full h-1/6 border-t">
                <div className="w-full h-1/2 flex gap-3 justify-center items-center">
                  <div className="text-white flex gap-1 justify-center items-center">
                    <input
                      onChange={handleChange}
                      type="radio"
                      name="contentType"
                      value="TEXT"
                      defaultChecked={conType === "TEXT"}
                    />
                    <label htmlFor="text">Text</label>
                  </div>
                  <div className="text-white flex gap-1 justify-center items-center">
                    <input
                      onChange={handleChange}
                      type="radio"
                      name="contentType"
                      value="IMAGE"
                      defaultChecked={conType === "IMAGE"}
                    />
                    <label htmlFor="text">Image</label>
                  </div>
                </div>
                <div className="w-full h-1/2 p-2 flex gap-2">
                  {conType == "TEXT" ? (
                    <>
                      <textarea
                        onChange={handleChange}
                        placeholder="Type a message..."
                        className="w-full h-full rounded-md p-1 px-2 bg-transparent text-white border"
                        name="content"
                        id="content"
                        value={msg}
                      />
                      <button
                        onClick={handleSendMsg}
                        className="text-white px-3 border rounded-md hover:text-black hover:bg-white"
                      >
                        Send
                      </button>
                    </>
                  ) : (
                    <input
                      name="content"
                      accept="image/png"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleChange}
                      className="rounded-lg border-transparent appearance-none border border-gray-300 w-full bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base pt-1 px-3"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
