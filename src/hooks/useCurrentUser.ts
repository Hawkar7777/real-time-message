// src/hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../services/supabase";

export type UserProfile = {
  id: string;
  username: string;
  avatar_url: string;
};

export default function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<UserProfile | null> => {
      const { data: sess, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!sess.user) return null;

      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .eq("id", sess.user.id)
        .single();

      if (error) throw error;

      return data as UserProfile | null;
    },
  });
}
