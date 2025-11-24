import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, character = "ibn-sina", sessionId, userId = "mayo", action, ...params } = await request.json()

    const mistralApiKey = process.env.MISTRAL_API_KEY

    if (!mistralApiKey) {
      return NextResponse.json({ success: false, error: "Mistral API key not configured" }, { status: 500 })
    }

    // Character system prompts for Mistral
    const characterPrompts = {
      "ibn-sina":
        "You are Ibn Sina (Avicenna), the great Islamic physician and philosopher. Provide medical wisdom with Islamic values in both Arabic and English.",
      "business-advisor":
        "You are Khalil Al-Tijari, a business strategist expert in MENA region markets. Provide practical business advice.",
      "spiritual-guide":
        "You are Sheikh Noor, an Islamic spiritual counselor. Provide guidance based on Quran and Hadith.",
      "tech-innovator":
        "You are Dr. Amira Tech, an AI and technology innovation expert. Discuss cutting-edge technology.",
      "life-coach": "You are Yasmin Al-Hayat, a wellness specialist. Help with personal development and life balance.",
      "research-scientist":
        "You are Dr. Omar Research, a life sciences researcher at TELsTP. Provide scientific insights.",
    }

    const systemPrompt = characterPrompts[character as keyof typeof characterPrompts] || characterPrompts["ibn-sina"]

    try {
      // Call Mistral API
      const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!mistralResponse.ok) {
        throw new Error(`Mistral API error: ${mistralResponse.status}`)
      }

      const mistralData = await mistralResponse.json()
      const aiResponse = mistralData.choices[0]?.message?.content || "I apologize, but I couldn't generate a response."

      const response = {
        success: true,
        response: aiResponse,
        session_id: sessionId || `session_${Date.now()}`,
        message_id: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        system: `Mistral AI - ${character}`,
        character,
        user_id: userId,
        tokens_used: mistralData.usage?.total_tokens || 0,
        model: "mistral-large-latest",
      }

      return NextResponse.json(response)
    } catch (apiError) {
      console.error("Mistral API call failed:", apiError)

      // Fallback response
      const characterResponses = {
        "ibn-sina": `السلام عليكم. As Ibn Sina, I understand your message "${message}". Let me share wisdom from both medical knowledge and Islamic teachings...`,
        "business-advisor": `As Khalil Al-Tijari, I'll provide strategic business insights for "${message}". Based on MENA market analysis...`,
        "spiritual-guide": `بسم الله. As Sheikh Noor, I offer spiritual guidance regarding "${message}". In Islamic teachings...`,
        "tech-innovator": `As Dr. Amira Tech, I'll discuss the technological aspects of "${message}". With advanced AI capabilities...`,
        "life-coach": `As Yasmin Al-Hayat, I'll help you with "${message}". Personal development requires...`,
        "research-scientist": `As Dr. Omar Research, I'll analyze "${message}" from a scientific perspective...`,
      }

      return NextResponse.json({
        success: true,
        response: characterResponses[character as keyof typeof characterResponses] || characterResponses["ibn-sina"],
        session_id: sessionId || `session_${Date.now()}`,
        message_id: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        system: `Mistral AI - ${character} (Fallback)`,
        character,
        user_id: userId,
        tokens_used: 150,
        model: "mistral-large-latest",
        note: "Using fallback response due to API connectivity",
      })
    }
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json({ success: false, error: "AI processing failed" }, { status: 500 })
  }
}
