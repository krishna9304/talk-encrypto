import { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

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
}

const Message: FunctionComponent<MessageProps> = ({
  content,
  contentType,
  from,
}) => {
  const { user } = useSelector((state: RootState) => state);
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
                  user.userId == from ? "bg-green-300" : "bg-white"
                }`}
              >
                <img className="w-full h-48" src={content} alt="img" />
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
