// src/components/MessageList.tsx
import { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";
import type { MessageRow } from "../services/chatService";

interface MessageListProps {
  messages?: MessageRow[];
  meId: string;
  themAvatar: string;
  meAvatar: string;
  onImageClick: (url: string) => void;
}

export default function MessageList({
  messages,
  meId,
  themAvatar,
  meAvatar,
  onImageClick,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto !p-4 space-y-4">
      {messages?.map((m) => (
        <MessageItem
          key={m.id}
          msg={m}
          isMine={m.sender_id === meId}
          avatar={m.sender_id === meId ? meAvatar : themAvatar}
          onImageClick={onImageClick}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
