"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import DeleteButton from "./components/DeleteButton"
import GoogleLoginButton from "./components/GoogleLoginButton"
import ExpandableText from "./components/ExpandableText"

export default function Home() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    async function loadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      const { data } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false })

      setArtworks(data || [])
    }

    loadData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    location.reload()
  }

  const filteredArtworks = artworks.filter((artwork) => {
    const title = artwork.title?.toLowerCase() || ""
    const description = artwork.description?.toLowerCase() || ""
    const category = artwork.category?.toLowerCase() || ""
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      title.includes(search) ||
      description.includes(search) ||
      category.includes(search)

    const matchesCategory =
      selectedCategory === "All" || artwork.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-pink-600 mb-4">
            Alyssa Creative Studio
          </h1>

          <p className="text-gray-700 text-xl">
            Artwork • LEGO • Photography • Stories
          </p>

          <p className="text-gray-500 mt-4">
            A collection of Alyssa&apos;s creative projects and imagination.
          </p>

          <div className="mt-6">
            {user ? (
              <div className="space-y-3">
                <p className="text-green-600 font-semibold">
                  Logged in as {user.email}
                </p>

                <button
                  onClick={handleLogout}
                  className="bg-gray-800 text-white px-5 py-2 rounded-full hover:bg-gray-900 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <GoogleLoginButton />
            )}
          </div>

          <a
            href="/add"
            className="inline-block mt-6 bg-pink-600 text-white font-bold px-6 py-3 rounded-full hover:bg-pink-700"
          >
            + Add New Artwork
          </a>

          <div className="mt-8 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by title, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />

            <div className="flex flex-wrap justify-center gap-3 mt-5">
              {[
                "All",
                "LEGO",
                "Drawing",
                "Photography",
                "Story",
                "Craft",
                "School Project",
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold ${
                    selectedCategory === category
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-64 object-cover"
              />

              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {artwork.title}
                </h2>

                <p className="text-pink-600 font-semibold mb-2">
                  {artwork.category}
                </p>

                <ExpandableText text={artwork.description} />

                <a
                  href={`/edit/${artwork.id}`}
                  className="mt-4 block w-full text-center bg-gray-800 text-white font-bold py-2 rounded-lg hover:bg-gray-900"
                >
                  Edit
                </a>

                <DeleteButton id={artwork.id} />
              </div>
            </div>
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="text-center mt-12 bg-white rounded-2xl shadow p-8">
            <p className="text-xl font-semibold text-gray-700">
              No artworks found.
            </p>
            <p className="text-gray-500 mt-2">
              Try a different search term or category.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}