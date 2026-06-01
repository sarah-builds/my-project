import { supabase } from "./supabase";

let cachedUser: any = null;

export async function getUserFast(forceRefresh = false) {
  if (!forceRefresh && cachedUser) return cachedUser;

  const { data } = await supabase.auth.getUser();
  cachedUser = data.user;

  return cachedUser;
}

export function clearUserCache() {
  cachedUser = null; // ✅ clear on logout
}
