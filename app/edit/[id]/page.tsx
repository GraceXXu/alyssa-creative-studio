"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"

export default function EditArtworkPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("LEGO")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadArtwork() {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        setMessage("Failed to load artwork: " + error.message)
        return
      }

      setTitle(data.title)
      setCategory(data.category)
      setDescription(data.description)
    }

    loadArtwork()
  }, [id])

  async function generateDescription() {
    if (!title || !category) {
      setMessage("Please enter a title and category first.")
      return
    }

    setAiLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
        }),
      })

      const data = await response.json()

      if (data.description) {
        setDescription(data.description)
        setMessage("AI description generated successfully!")
      } else {
        setMessage("AI generation failed.")
      }
    } catch (error) {
      setMessage("Something went wrong.")
    }

    setAiLoading(false)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()

    if (!title || !category || !description) {
      setMessage("Please fill out all fields.")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase
      .from("artworks")
      .update({
        title,
        category,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      setMessage("Update failed: " + error.message)
      setLoading(false)
      return
    }

    setLoading(false)

    router.push("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">
          Edit Artwork
        </h1>

        {message && (
          <p className="text-sm text-pink-600 font-semibold mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">

          <div>
            <label className="block font-semibold mb-2">
              Title
            </label>

            <input
              className="w-full border rounded-lg p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Category
            </label>

            <select
              className="w-full border rounded-lg p-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="LEGO">LEGO</option>
              <option value="Drawing">Drawing</option>
              <option value="Photography">Photography</option>
              <option value="Story">Story</option>
              <option value="Craft">Craft</option>
              <option value="School Project">School Project</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Description
            </label>

            <textarea
              className="w-full border rounded-lg p-3"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={generateDescription}
            disabled={aiLoading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {aiLoading
              ? "Generating..."
              : "Generate Description with AI"}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

        </form>
      </div>
    </main>
  )
}