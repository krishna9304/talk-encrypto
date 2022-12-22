import { AxiosResponse } from "axios";
import { FunctionComponent, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import networkFetch from "../../utils/axios";
import { ApiRoutes } from "../../utils/constants";

export enum CONTENT_TYPE {
  "TEXT",
  "IMAGE",
  "AUDIO",
  "VIDEO",
  "DOC",
}

export interface MessageProps {
  content: string;
  contentType: string;
  to: string;
  from: string;
  isEncrypted?: boolean;
  secretMsgDefault?: string;
}

const Message: FunctionComponent<MessageProps> = ({
  content,
  contentType,
  from,
  isEncrypted = false,
  secretMsgDefault = "",
}) => {
  const [{ jwt }, ,] = useCookies<
    "jwt",
    {
      jwt: string;
    }
  >(["jwt"]);
  const { user } = useSelector((state: RootState) => state);
  const [passInp, setPassInp] = useState(false);
  const [passphrase, setPassPhrase] = useState("");
  const [secretMsg, setSecretMsg] = useState(secretMsgDefault);

  const handleClick = async () => {
    if (user.userId) {
      try {
        const filename = content.split("/static/")[1];
        networkFetch.defaults.headers.common["x-access-token"] = jwt;
        const res: AxiosResponse<{
          code: number;
          data: { decoded_message: string };
          message: string;
          type: string;
        }> = await networkFetch.post(ApiRoutes.decodeFile(), {
          filename,
          passphrase,
        });
        setSecretMsg(res.data.data.decoded_message);
        setPassInp(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    setSecretMsg("");
  }, []);
  return (
    <div
      className={`w-full flex p-2 ${
        user.userId == from ? "flex-row-reverse" : ""
      } items-center`}
    >
      {(() => {
        switch (contentType) {
          case "IMAGE":
            return (
              <div
                className={`rounded-md p-2 ${
                  user.userId == from
                    ? "bg-green-300 rounded-br-none"
                    : "bg-white rounded-bl-none"
                }`}
              >
                <img className="w-full h-48" src={content} alt="img" />
                {isEncrypted && !passInp && !secretMsg.length && (
                  <div className="text-xs mt-2 italic">
                    This image contains a secret message.{" "}
                    <span
                      onClick={() => setPassInp(true)}
                      className="font-bold text-blue-500 cursor-pointer hover:underline"
                    >
                      Click Here
                    </span>{" "}
                    to view.
                  </div>
                )}
                {isEncrypted && passInp && (
                  <div className="text-xs mt-2 italic w-full flex gap-2">
                    <input
                      className="w-full py-1 px-2 outline-none"
                      placeholder="Enter your passphrase"
                      type="password"
                      name="passphrase"
                      onChange={(e) => setPassPhrase(e.target.value)}
                    />
                    <button
                      onClick={handleClick}
                      className="py-1 px-2 rounded-md text-white bg-blue-500 font-bold"
                    >
                      Unlock
                    </button>
                    <button
                      onClick={() => setPassInp(false)}
                      className="border-2 border-red-500 py-1 px-2 rounded-md text-red-500 font-bold"
                    >
                      Close
                    </button>
                  </div>
                )}
                {isEncrypted && secretMsg.length !== 0 && (
                  <div className="text-sm mt-2 text-center">{secretMsg}</div>
                )}
              </div>
            );

          default:
            return (
              <div
                style={{
                  wordWrap: "break-word",
                  maxWidth: "50%",
                }}
                className={`rounded-md p-2 px-4 ${
                  user.userId == from
                    ? "bg-green-300 rounded-br-none"
                    : "bg-white rounded-bl-none"
                }`}
              >
                {content}
              </div>
            );
        }
      })()}
    </div>
  );
};

export default Message;
