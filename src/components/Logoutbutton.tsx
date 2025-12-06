"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={logout}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Log out
    </button>
  );
}
