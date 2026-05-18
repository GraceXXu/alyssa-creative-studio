import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { title, category } = body

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "cherryxu2008@gmail.com",
      subject: "New Artwork Uploaded!",
      html: `
        <h1>New Artwork Uploaded</h1>

        <p><strong>Title:</strong> ${title}</p>

        <p><strong>Category:</strong> ${category}</p>

        <p>Your artwork was uploaded successfully.</p>
      `,
    })

    return Response.json(data)

  } catch (error) {
    return Response.json(
      { error },
      { status: 500 }
    )
  }
}