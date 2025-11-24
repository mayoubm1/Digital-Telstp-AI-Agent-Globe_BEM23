import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const proposalData = await request.json()

    const response = await fetch(`${process.env.FIREBASE_FUNCTIONS_URL}/generate-proposal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIREBASE_AUTH_TOKEN}`,
      },
      body: JSON.stringify(proposalData),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Proposal generation failed" }, { status: 500 })
  }
}
