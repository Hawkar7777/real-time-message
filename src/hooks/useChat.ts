// src/hooks/useChat.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversation,
  subscribeToConversation,
  sendMessage,
  markConversationAsSeen,
} from "../services/chatService";
import { supabase } from "../services/supabase"; // for online lookup
import type { MessageRow } from "../services/chatService";
import { useEffect } from "react";

export default function useChat(me: string, them: string | null) {
  const qc = useQueryClient();
  const convoKey = ["messages", them];

  // 1) Fetch + cache the full conversation (with receiver_online)
  const query = useQuery<MessageRow[]>({
    queryKey: convoKey,
    queryFn: () => fetchConversation(me, them!),
    enabled: !!them,
  });

  // 2) Mark as seen on first open
  useEffect(() => {
    if (me && them) markConversationAsSeen(me, them);
  }, [me, them]);

  // 3) Real-time subscribe: INSERT + UPDATE
  useEffect(() => {
    if (!them) return;

    const unsubscribe = subscribeToConversation(
      me,
      them,
      // onNew (incoming or outgoing)
      async (msg) => {
        // if it's incoming (to me), receiver_online is always 'true' for me showing
        if (msg.receiver_id === me) {
          qc.setQueryData(convoKey, (old: MessageRow[] = []) => [
            ...old,
            { ...msg, receiver_online: true },
          ]);
          markConversationAsSeen(me, them);
        } else {
          // outgoing: look up if 'them' is currently online
          const { data: userRow } = await supabase
            .from("users")
            .select("is_online")
            .eq("id", them)
            .single();

          qc.setQueryData(convoKey, (old: MessageRow[] = []) => [
            ...old,
            { ...msg, receiver_online: userRow?.is_online ?? false },
          ]);
        }
      },
      // onUpdate (e.g. seen flag or online-status change pushed via your user-status UPDATEs)
      (updatedMsg) => {
        qc.setQueryData(convoKey, (old: MessageRow[] = []) =>
          old.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
        );
      }
    );

    return () => {
      // Call unsubscribe but ignore promise to keep cleanup synchronous
      void unsubscribe();
    };
  }, [me, them, qc]);

  // 4) Sending mutation
  const mutation = useMutation({
    mutationFn: ({ content, file }: { content: string; file?: File }) =>
      sendMessage(me, them!, content, file),
  });

  return {
    messages: query.data,
    isLoading: query.isLoading,
    send: (content: string, file?: File) => mutation.mutate({ content, file }),
    isSending: mutation.isPending,
  };
}
