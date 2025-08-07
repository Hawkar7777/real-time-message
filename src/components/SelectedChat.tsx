import { useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import useChat from "../hooks/useChat";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import useUserProfileById from "../hooks/useUserProfileById";
import type { SelectedChatProps } from "../types";
import Spinner from "../ui/Spinner";

export default function SelectedChat({
  selectedUser,
  onSelectUser,
}: SelectedChatProps) {
  const [draft, setDraft] = useState<string>("");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { data: me } = useCurrentUser();

  // Call hooks unconditionally with fallback values
  const otherUser = useUserProfileById(selectedUser?.id ?? null);
  const { messages, isLoading, send, isSending } = useChat(
    me?.id ?? "",
    selectedUser?.id ?? ""
  );

  if (!selectedUser || !me) {
    return (
      <section className="col-span-3 flex items-center justify-center bg-purple-200 rounded-xl text-center flex-1 ">
        <div>
          <h1 className="text-3xl font-bold">Welcome To Random Chatty</h1>
          <p className="!mt-2 text-lg">Select a conversation in the sidebar.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-3 flex flex-col bg-purple-100 rounded-xl overflow-hidden h-full">
      <ChatHeader user={otherUser} onSelectUser={onSelectUser} />

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-purple-800">
          <Spinner />
        </div>
      ) : (
        <MessageList
          messages={messages}
          meId={me.id}
          themAvatar={otherUser?.avatar_url || ""}
          meAvatar={me.avatar_url}
          onImageClick={setModalImage}
        />
      )}

      <MessageInput
        value={draft}
        onChange={setDraft}
        onSend={(file) => {
          if (draft.trim() || file) {
            send(draft.trim(), file);
          }
          setDraft("");
        }}
        disabled={isSending}
      />

      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="attachment"
            className="max-h-full max-w-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </section>
  );
}
