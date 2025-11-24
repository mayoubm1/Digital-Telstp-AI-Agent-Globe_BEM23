import { type NextRequest, NextResponse } from "next/server"

// Knowledge base API endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  // Simulate knowledge retrieval from your backend
  const knowledge = [
    {
      id: 1,
      category: "business_development",
      title: "Strategic Planning Fundamentals",
      content: "Core principles of business strategy and planning...",
      confidence_score: 0.95,
      tags: ["strategy", "planning", "business"],
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      category: "islam",
      title: "Islamic Business Ethics",
      content: "Principles of ethical business conduct in Islam...",
      confidence_score: 0.92,
      tags: ["ethics", "islam", "business"],
      created_at: new Date().toISOString(),
    },
  ]

  const filtered = knowledge.filter(
    (k) =>
      (!category || k.category === category) &&
      (!search ||
        k.title.toLowerCase().includes(search.toLowerCase()) ||
        k.content.toLowerCase().includes(search.toLowerCase())),
  )

  return NextResponse.json({ success: true, entries: filtered, total: filtered.length })
}
