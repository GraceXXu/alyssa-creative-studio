"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function AddArtworkPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("LEGO")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setMessage("Please sign in before uploading artwork.")
        return
      }

      setUserEmail(session.user.email || null)
    }

    checkUser()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile))
    } else {
      setPreviewUrl("")
    }
  }

  async function generateDescription() {
    if (!title || !category) {
      setMessage("Please enter a title and category first.")
      return
    }

    setLoading(true)
    setMessage("Generating AI description...")

    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
        }),
      })

      const data = await res.json()

      if (data.description) {
        setDescription(data.description)
        setMessage("AI description generated successfully!")
      } else {
        setMessage("AI description failed.")
      }
    } catch (error) {
      setMessage("Something went wrong with AI generation.")
    }

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setMessage("Please sign in before uploading artwork.")
      return
    }

    if (!title || !category || !description || !file) {
      setMessage("Please fill out all fields and choose an image.")
      return
    }

    setLoading(true)
    setMessage("")

    const safeFileName = file.name.replace(/\s+/g, "-").toLowerCase()
    const fileName = `${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from("artwork-images")
      .upload(fileName, file)

    if (uploadError) {
      setMessage("Image upload failed: " + uploadError.message)
      setLoading(false)
      return
    }

    const { data } = supabase.storage
      .from("artwork-images")
      .getPublicUrl(fileName)

    const imageUrl = data.publicUrl

    const { error: insertError } = await supabase
      .from("artworks")
      .insert({
        title,
        category,
        description,
        image_url: imageUrl,
      })

    if (insertError) {
      setMessage("Database insert failed: " + insertError.message)
      setLoading(false)
      return
    }

    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        category,
      }),
    })

    setMessage("Artwork uploaded successfully!")
    setLoading(false)

    router.push("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-3">
          Add New Artwork
        </h1>

        {userEmail && (
          <p className="text-sm text-green-600 font-semibold mb-6">
            Signed in as {userEmail}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">Title</label>
            <input
              className="w-full border rounded-lg p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: LEGO Castle"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Category</label>
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
              placeholder="Describe Alyssa's creative project..."
            />

            <button
              type="button"
              onClick={generateDescription}
              disabled={loading}
              className="mt-3 bg-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              Generate Description with AI
            </button>
          </div>

          <div>
            <label className="block font-semibold mb-2">Image</label>

            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-lg p-3"
              onChange={handleFileChange}
            />
          </div>

          {previewUrl && (
            <div>
              <p className="font-semibold mb-2">Preview</p>

              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl border"
              />
            </div>
          )}

          {message && (
            <p className="text-sm text-pink-600 font-semibold">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload Artwork"}
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