import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguages } = await request.json()

    // This would connect to your Firebase Functions
    const response = await fetch(`${process.env.FIREBASE_FUNCTIONS_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIREBASE_AUTH_TOKEN}`,
      },
      body: JSON.stringify({ text, targetLanguages }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 })
  }
}
