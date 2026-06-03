import { SuccessToast, WarningToast, DangerToast } from "./Notification";
import store from "../store.js";
import { useState, useEffect } from "react";

export default function NotificationArea() {
  const [messages, setMessages] = useState(store.getMessages());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setMessages([...store.getMessages()]);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed bottom-0 mb-12 w-full flex flex-col items-center z-50 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {messages.map((message) => {
          switch (message.type.toLowerCase()) {
            case "success":
              return <SuccessToast key={message.id} message={message.message} />;
            case "warning":
              return <WarningToast key={message.id} message={message.message} />;
            case "error":
            case "danger":
              return <DangerToast key={message.id} message={message.message} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
