import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { useEffect } from "react";

export type OtherUser = {
  id: string;
  username: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string | null;
};

export default function useUserProfileById(userId: string | null) {
  const qc = useQueryClient();

  const query = useQuery<OtherUser>({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No userId provided");

      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url, is_online, last_seen")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`presence-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          qc.setQueryData(["user", userId], payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  return query.data || null;
}
