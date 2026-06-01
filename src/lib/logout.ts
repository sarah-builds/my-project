import { supabase } from "../lib/supabase";
import { isDemoMode, clearAppMode } from "./appMode";
import { clearUserCache } from "./auth"; // ✅ import

export async function logout(navigate: (path: string) => void) {
  if (isDemoMode()) {
    clearAppMode();
    navigate("/");
    return;
  }

  clearUserCache(); // ✅ clear cached user
  await supabase.auth.signOut();
  
  // ✅ force clear all supabase localStorage keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) localStorage.removeItem(key);
  });

  navigate("/login");
}
