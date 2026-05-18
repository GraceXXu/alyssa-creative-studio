"use client"

import { useState } from "react"

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <p
        className={`text-gray-600 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {text}
      </p>

      {text && text.length > 80 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-pink-600 font-semibold text-sm hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  )
}