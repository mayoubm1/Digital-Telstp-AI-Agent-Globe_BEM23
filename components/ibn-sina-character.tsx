"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  type: "user" | "assistant"
}

const IbnSinaCharacter = () => {
  const [currentEmotion, setCurrentEmotion] = useState("neutral")
  const [speaking, setSpeaking] = useState(false)
  const [contactMethod, setContactMethod] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [currentSpeech, setCurrentSpeech] = useState("")
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)

  // Character position states
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })

  // Emotions mapping to facial expressions and animations
  const emotions = {
    neutral: {
      svgPath: `
        <svg viewBox="0 0 400 600" className="w-full h-full">
          <!-- Ibn Sina's traditional appearance -->
          <defs>
            <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
              <stop offset="0%" style="stop-color:#D2B48C;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8B7355;stop-opacity:1" />
            </radialGradient>
          </defs>
          <!-- Face shape -->
          <ellipse cx="200" cy="200" rx="80" ry="100" fill="url(#faceGradient)" stroke="#654321" strokeWidth="2"/>
          <!-- Beard -->
          <path d="M140 250 Q200 300 260 250 Q250 320 200 330 Q150 320 140 250" fill="#2F1B14"/>
          <!-- Eyes -->
          <ellipse cx="170" cy="180" rx="8" ry="12" fill="#000000"/>
          <ellipse cx="230" cy="180" rx="8" ry="12" fill="#000000"/>
          <!-- Eyebrows -->
          <path d="M160 165 Q175 160 185 165" stroke="#2F1B14" strokeWidth="3" fill="none"/>
          <path d="M215 165 Q225 160 240 165" stroke="#2F1B14" strokeWidth="3" fill="none"/>
          <!-- Nose -->
          <path d="M200 190 L195 210 L200 215 L205 210 Z" fill="#B8860B"/>
          <!-- Mouth -->
          <path d="M185 230 Q200 240 215 230" stroke="#8B4513" strokeWidth="2" fill="none"/>
          <!-- Traditional turban -->
          <ellipse cx="200" cy="120" rx="90" ry="40" fill="#2C3E50"/>
          <path d="M110 120 Q200 80 290 120 Q280 100 200 90 Q120 100 110 120" fill="#34495E"/>
          <!-- Traditional robe -->
          <rect x="120" y="300" width="160" height="280" fill="#2C3E50" rx="20"/>
          <path d="M140 320 L260 320 L250 340 L150 340 Z" fill="#34495E"/>
        </svg>
      `,
      animation: "gentle-sway",
    },
    compassionate: {
      svgPath: `
        <svg viewBox="0 0 400 600" className="w-full h-full">
          <defs>
            <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
              <stop offset="0%" style="stop-color:#D2B48C;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8B7355;stop-opacity:1" />
            </radialGradient>
          </defs>
          <!-- Face with slight smile -->
          <ellipse cx="200" cy="200" rx="80" ry="100" fill="url(#faceGradient)" stroke="#654321" strokeWidth="2"/>
          <!-- Beard -->
          <path d="M140 250 Q200 300 260 250 Q250 320 200 330 Q150 320 140 250" fill="#2F1B14"/>
          <!-- Warm eyes -->
          <ellipse cx="170" cy="180" rx="8" ry="12" fill="#000000"/>
          <ellipse cx="230" cy="180" rx="8" ry="12" fill="#000000"/>
          <!-- Raised eyebrows -->
          <path d="M160 162 Q175 157 185 162" stroke="#2F1B14" strokeWidth="3" fill="none"/>
          <path d="M215 162 Q225 157 240 162" stroke="#2F1B14" strokeWidth="3" fill="none"/>
          <!-- Nose -->
          <path d="M200 190 L195 210 L200 215 L205 210 Z" fill="#B8860B"/>
          <!-- Gentle smile -->
          <path d="M185 230 Q200 245 215 230" stroke="#8B4513" strokeWidth="2" fill="none"/>
          <!-- Traditional turban -->
          <ellipse cx="200" cy="120" rx="90" ry="40" fill="#2C3E50"/>
          <path d="M110 120 Q200 80 290 120 Q280 100 200 90 Q120 100 110 120" fill="#34495E"/>
          <!-- Traditional robe -->
          <rect x="120" y="300" width="160" height="280" fill="#2C3E50" rx="20"/>
          <path d="M140 320 L260 320 L250 340 L150 340 Z" fill="#34495E"/>
        </svg>
      `,
      animation: "gentle-nod",
    },
    listening: {
      svgPath: `
        <svg viewBox="0 0 400 600" className="w-full h-full">
          <defs>
            <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
              <stop offset="0%" style="stop-color:#D2B48C;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8B7355;stop-opacity:1" />
            </radialGradient>
          </defs>
          <!-- Slightly tilted face -->
          <ellipse cx="205" cy="200" rx="80" ry="100" fill="url(#faceGradient)" stroke="#654321" strokeWidth="2" transform="rotate(5 205 200)"/>
          <!-- Beard -->
          <path d="M145 250 Q205 300 265 250 Q255 320 205 330 Q155 320 145 250" fill="#2F1B14" transform="rotate(5 205 250)"/>
          <!-- Focused eyes -->
          <ellipse cx="175" cy="180" rx="8" ry="12" fill="#000000" transform="rotate(5 175 180)"/>
          <ellipse cx="235" cy="180" rx="8" ry="12" fill="#000000" transform="rotate(5 235 180)"/>
          <!-- Concentrated eyebrows -->
          <path d="M165 165 Q180 160 190 165" stroke="#2F1B14" strokeWidth="3" fill="none" transform="rotate(5 177 165)"/>
          <path d="M220 165 Q230 160 245 165" stroke="#2F1B14" strokeWidth="3" fill="none" transform="rotate(5 232 165)"/>
          <!-- Nose -->
          <path d="M205 190 L200 210 L205 215 L210 210 Z" fill="#B8860B" transform="rotate(5 205 210)"/>
          <!-- Neutral mouth -->
          <path d="M190 230 Q205 235 220 230" stroke="#8B4513" strokeWidth="2" fill="none" transform="rotate(5 205 230)"/>
          <!-- Traditional turban -->
          <ellipse cx="205" cy="120" rx="90" ry="40" fill="#2C3E50" transform="rotate(5 205 120)"/>
          <path d="M115 120 Q205 80 295 120 Q285 100 205 90 Q125 100 115 120" fill="#34495E" transform="rotate(5 205 105)"/>
          <!-- Traditional robe -->
          <rect x="125" y="300" width="160" height="280" fill="#2C3E50" rx="20" transform="rotate(5 205 440)"/>
          <path d="M145 320 L265 320 L255 340 L155 340 Z" fill="#34495E" transform="rotate(5 205 330)"/>
        </svg>
      `,
      animation: "slight-tilt",
    },
  }

  // Animation keyframes for character movement
  const animations = {
    "gentle-sway": "animate-pulse",
    "gentle-nod": "animate-bounce",
    "slight-tilt": "animate-pulse",
  }

  // Speech synthesis setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthesisRef.current = window.speechSynthesis
    }
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel()
      }
    }
  }, [])

  // Character movement animation
  useEffect(() => {
    const animateMovement = () => {
      setPosition((prev) => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.1,
        y: prev.y + (targetPosition.y - prev.y) * 0.1,
      }))
      requestAnimationFrame(animateMovement)
    }
    const animationId = requestAnimationFrame(animateMovement)
    return () => cancelAnimationFrame(animationId)
  }, [targetPosition])

  const speak = async (text: string, language = "en-US") => {
    if (!audioEnabled || !speechSynthesisRef.current) return

    setSpeaking(true)
    setCurrentSpeech(text)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 0.8
    utterance.pitch = 1.0

    utterance.onend = () => {
      setSpeaking(false)
      setCurrentSpeech("")
    }

    speechSynthesisRef.current.speak(utterance)
  }

  const determineEmotion = (input: string): keyof typeof emotions => {
    const lowerInput = input.toLowerCase()
    if (lowerInput.includes("help") || lowerInput.includes("support") || lowerInput.includes("guidance")) {
      return "compassionate"
    } else if (lowerInput.includes("listen") || lowerInput.includes("tell") || lowerInput.includes("explain")) {
      return "listening"
    }
    return "neutral"
  }

  const calculateNewPosition = (emotion: keyof typeof emotions) => {
    const movements = {
      neutral: { x: 0, y: 0 },
      compassionate: { x: -5, y: -3 },
      listening: { x: 8, y: -2 },
    }
    return movements[emotion]
  }

  const generateResponse = async (input: string) => {
    // Simulate AI response generation
    const responses = {
      greeting:
        "Peace be upon you. I am Ibn Sina, at your service. How may I assist you in matters of health, wisdom, or knowledge?",
      medical: "As a physician, I believe in treating both the body and the soul. What concerns you about your health?",
      philosophy: "True knowledge comes from both observation and contemplation. What wisdom do you seek?",
      default:
        "I am here to share the knowledge I have gathered through years of study and practice. Please, tell me what troubles you.",
    }

    const lowerInput = input.toLowerCase()
    if (lowerInput.includes("hello") || lowerInput.includes("greet")) {
      return { speech: responses.greeting, text: responses.greeting }
    } else if (lowerInput.includes("health") || lowerInput.includes("medical")) {
      return { speech: responses.medical, text: responses.medical }
    } else if (lowerInput.includes("wisdom") || lowerInput.includes("philosophy")) {
      return { speech: responses.philosophy, text: responses.philosophy }
    }
    return { speech: responses.default, text: responses.default }
  }

  const handleResponseGeneration = async (input: string) => {
    // Update emotion based on input content
    const emotion = determineEmotion(input)
    setCurrentEmotion(emotion)

    // Generate response and animate character
    const response = await generateResponse(input)
    setTargetPosition(calculateNewPosition(emotion))

    // Add to chat history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date(),
      type: "user",
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: response.text,
      timestamp: new Date(),
      type: "assistant",
    }

    setChatHistory((prev) => [...prev, userMessage, assistantMessage])

    // Speak response if audio is enabled
    await speak(response.speech)

    return response
  }

  const summarizeInteractions = (history: ChatMessage[]) => {
    return `Session with ${history.length} interactions. Topics discussed: health, wisdom, guidance.`
  }

  const generateChatReport = () => {
    return {
      timestamp: new Date().toISOString(),
      sessionId: Date.now().toString(),
      interactions: chatHistory,
      contactMethod,
      summary: summarizeInteractions(chatHistory),
      character: "Ibn Sina - The Great Physician and Philosopher",
    }
  }

  const sendChatReport = async () => {
    const report = generateChatReport()
    try {
      // This would integrate with actual contact methods
      console.log("Chat report generated:", report)
      alert(`Chat report prepared for ${contactMethod || "default method"}. Check console for details.`)
    } catch (error) {
      console.error("Error sending report:", error)
    }
  }

  const enableAudio = () => {
    setAudioEnabled(true)
  }

  return (
    <div className="fixed bottom-0 right-0 w-96 h-96 z-50">
      {/* Character container */}
      <div
        className={`absolute bottom-0 right-0 transition-transform duration-1000 ${animations[emotions[currentEmotion].animation]}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <div
          className="w-64 h-64 cursor-pointer"
          dangerouslySetInnerHTML={{ __html: emotions[currentEmotion].svgPath }}
          onClick={() => handleResponseGeneration("Hello Ibn Sina")}
        />

        {/* Speech bubble */}
        {speaking && currentSpeech && (
          <div className="absolute top-0 left-0 transform -translate-x-full -translate-y-4">
            <div className="bg-white rounded-lg p-4 shadow-lg max-w-xs border-2 border-emerald-200">
              <p className="text-sm text-gray-800">{currentSpeech}</p>
              <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2">
                <div className="w-0 h-0 border-l-8 border-l-white border-t-8 border-t-transparent border-b-8 border-b-transparent"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control panel */}
      <div className="absolute bottom-0 left-0 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg max-w-xs">
        {!audioEnabled && (
          <Alert className="mb-4">
            <AlertDescription>
              <Button onClick={enableAudio} size="sm" className="w-full">
                Enable Audio for Ibn Sina
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Your preferred contact method"
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            className="text-sm"
          />
          <Button onClick={sendChatReport} className="w-full text-sm" size="sm">
            Send Session Report
          </Button>
          <p className="text-xs text-gray-600 text-center">Click Ibn Sina to interact</p>
        </div>
      </div>

      {/* Emotion indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-3 h-3 rounded-full ${
            currentEmotion === "compassionate"
              ? "bg-green-400"
              : currentEmotion === "listening"
                ? "bg-blue-400"
                : "bg-gray-400"
          }`}
        ></div>
      </div>
    </div>
  )
}

export default IbnSinaCharacter
