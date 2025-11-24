import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { action, directory } = await request.json()

    // Call Python backend for file management operations
    const response = await fetch(`${process.env.PYTHON_BACKEND_URL}/file-management`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, directory }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ status: "error", message: "File management operation failed" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get file management status
    const response = await fetch(`${process.env.PYTHON_BACKEND_URL}/file-management/status`)
    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to get file management status" }, { status: 500 })
  }
}
