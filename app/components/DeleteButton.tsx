"use client"

import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artwork?"
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from("artworks")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Delete failed: " + error.message)
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="mt-4 w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600"
    >
      Delete
    </button>
  )
}