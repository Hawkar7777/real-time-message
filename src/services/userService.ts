// src/services/userService.ts
import { supabase } from "./supabase";
import type { User } from "../types";

export async function getUserProfile(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateUsername({
  id,
  username,
}: {
  id: string;
  username: string;
}) {
  const { error } = await supabase
    .from("users")
    .update({ username })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchUsersExcluding(
  currentUserId: string
): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, avatar_url, is_online")
    .neq("id", currentUserId)
    .order("username");

  if (error) throw new Error(error.message);
  return data as User[];
}
