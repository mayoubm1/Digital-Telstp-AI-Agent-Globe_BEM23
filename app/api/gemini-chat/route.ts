import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { message, character, language } = await request.json()

    // Create character-specific prompt
    const characterPrompt = `You are ${character.name} (${character.nameAr}), a ${character.specialty} specialist. 
    Your personality: ${character.personality}
    
    Respond in ${language === "ar" ? "Arabic" : "English"} with proper medical terminology and cultural sensitivity.
    Keep responses concise but informative, suitable for voice interaction.
    
    User message: ${message}`

    // Call Gemini CLI
    const command = `gemini "${characterPrompt}"`
    const { stdout } = await execAsync(command)

    return NextResponse.json({
      response: stdout.trim(),
      character: character.name,
      language,
    })
  } catch (error) {
    console.error("Gemini CLI error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
