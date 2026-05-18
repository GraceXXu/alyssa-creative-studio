"use client"

import { supabase } from "@/lib/supabase/client"

export default function GoogleLoginButton() {
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="bg-white border border-gray-300 px-6 py-3 rounded-full shadow hover:bg-gray-100 font-semibold"
    >
      Sign in with Google
    </button>
  )
}