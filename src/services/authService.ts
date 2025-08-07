// src/services/authService.ts
import { localDate } from "../utils/localDate";
import { supabase } from "./supabase";

export async function checkUserExists(email: string, username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .or(`username.eq.${username},email.eq.${email}`);

  if (error) throw new Error(error.message);
  return data.length > 0;
}

export async function signupUser({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) {
  // First, sign up the user in auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw new Error(signUpError.message);

  const userId = authData.user?.id;

  if (!userId) throw new Error("User ID not found");

  const created_at = localDate();
  // Then, insert into public.users table
  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    username,
    email,
    created_at,
  });

  if (userError) throw new Error(userError.message);

  return authData;
}

export async function signinUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}
