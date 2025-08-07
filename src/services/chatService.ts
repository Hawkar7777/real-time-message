// src/services/chatService.ts
import { localDate } from "../utils/localDate";
import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export type MessageRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  seen: boolean;
  seen_at: string | null;
  file_url: string | null;
  receiver_online?: boolean;
};

export async function fetchConversation(
  me: string,
  them: string
): Promise<(MessageRow & { receiver?: { is_online: boolean } })[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      receiver:receiver_id ( is_online )
    `
    )
    .or(
      `and(sender_id.eq.${me},receiver_id.eq.${them}),` +
        `and(sender_id.eq.${them},receiver_id.eq.${me})`
    )
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((msg: any) => ({
    ...msg,
    receiver_online: msg.receiver?.is_online ?? false,
  }));
}

export async function markConversationAsSeen(me: string, them: string) {
  const { error } = await supabase
    .from("messages")
    .update({ seen: true, seen_at: new Date().toISOString() })
    .eq("sender_id", them)
    .eq("receiver_id", me)
    .eq("seen", false);

  if (error) console.error("markConversationAsSeen:", error);
}

export async function fetchUnseenCounts(
  me: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("receiver_id", me)
    .eq("seen", false);

  if (error) throw error;
  return (data ?? []).reduce<Record<string, number>>((acc, m: any) => {
    acc[m.sender_id] = (acc[m.sender_id] || 0) + 1;
    return acc;
  }, {});
}

export function subscribeToConversation(
  me: string,
  them: string,
  onNew: (msg: MessageRow) => void,
  onUpdate: (msg: MessageRow) => void
) {
  const channel = supabase
    .channel(`chat_${me}_${them}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      ({ new: msg }: { new: MessageRow }) => {
        if (
          (msg.sender_id === me && msg.receiver_id === them) ||
          (msg.sender_id === them && msg.receiver_id === me)
        ) {
          onNew({ ...msg, receiver_online: true });
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages" },
      ({ new: msg }: { new: MessageRow }) => {
        if (
          (msg.sender_id === me && msg.receiver_id === them) ||
          (msg.sender_id === them && msg.receiver_id === me)
        ) {
          onUpdate(msg);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function sendMessage(
  sender_id: string,
  receiver_id: string,
  content: string,
  file?: File
) {
  let file_url: string | null = null;

  if (file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${file.name}${uuidv4()}.${fileExt}`;

    let folder = "message-image";
    if (file.type.startsWith("audio/")) {
      folder = "message-audio";
    }
    if (file.type.startsWith("application/pdf")) {
      folder = "message-pdf";
    }

    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("chat-images")
      .getPublicUrl(filePath);

    file_url = urlData.publicUrl;
  }

  const { error } = await supabase
    .from("messages")
    .insert([
      { sender_id, receiver_id, content, created_at: localDate(), file_url },
    ]);

  if (error) throw error;
}
