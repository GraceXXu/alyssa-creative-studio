import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
})

export async function POST(req: Request) {
  try {
    const { title, category } = await req.json()

    if (!title || !category) {
      return Response.json(
        { error: "Title and category are required." },
        { status: 400 }
      )
    }

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You write short warm child-friendly artwork descriptions.",
        },
        {
          role: "user",
          content: `
Write a short artwork description.

Title: ${title}
Category: ${category}

Requirements:
- 1 sentence
- 20-35 words
- Positive and polished
- Do not mention AI
`,
        },
      ],
    })

    const description = completion.choices[0].message.content

    return Response.json({ description })
  } catch (error) {
    console.error(error)

    return Response.json(
      { error: "Failed to generate description." },
      { status: 500 }
    )
  }
}