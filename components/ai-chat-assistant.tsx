"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, Mic, MicOff } from "lucide-react"

interface Character {
  id: string
  name: string
  arabicName?: string
  gender: "male" | "female" | "neutral"
  role: string
  description: string
  dataAccess: string[]
  avatar: string
  videoUrl?: string
  growthLevel: number
  specialties: string[]
  isCustomizable: boolean
}

interface ChatMessage {
  text: string
  sender: "user" | "ai"
  timestamp: Date
  characterId?: string
  emotion?: "neutral" | "happy" | "concerned" | "thinking" | "speaking"
}

const defaultCharacters: Character[] = [
  {
    id: "ibn-sina",
    name: "ابن سينا", // Arabic name fixed
    arabicName: "ابن سينا",
    gender: "male",
    role: "Chief Medical Advisor",
    description: "Classical Islamic physician and philosopher, expert in traditional and modern medicine",
    dataAccess: ["medical_history", "symptoms", "treatments", "medications"],
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/output%20%282%29-p41U1omIINqaCNL7NQLsJBgVPsmNF0.jpeg",
    videoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2dfb29c5-449a-4367-bc7f-a828c0cd02dc-4btUEjUjKnpXdy0u5aJg16aqSQvHto.mp4",
    growthLevel: 100, // Master level
    specialties: ["Internal Medicine", "Philosophy", "Herbal Medicine", "Diagnostics"],
    isCustomizable: false,
  },
  {
    id: "personal-companion",
    name: "", // User customizable
    gender: "neutral",
    role: "Personal Wellness Companion",
    description: "Your dedicated personal health and wellness companion that grows with you",
    dataAccess: ["personal_data", "daily_habits", "mood_tracking", "goals", "preferences"],
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eda8ba25-805d-4e4e-b0c6-e2db0e9a1d29.png-r9EmwMmyIwgJUXjGMIGKxKtAcBglMS.jpeg",
    videoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c91d30f1-b678-486d-a91b-eace74074746%20%281%29-ItWFsbcInhhmISd9xmvCYguZZWCitF.mp4",
    growthLevel: 1, // Starts at level 1
    specialties: ["Personal Care", "Habit Tracking", "Emotional Support", "Goal Setting"],
    isCustomizable: true,
  },
  {
    id: "specialist-doctor",
    name: "", // User customizable
    gender: "neutral",
    role: "Medical Specialist",
    description: "Specialized medical expert for complex health conditions",
    dataAccess: ["medical_records", "lab_results", "imaging", "specialist_reports"],
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/technology_scene_image_final_17.png-rLZgTyxTBITkA0mnYXHIPE6Bgd9GOu.webp",
    videoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img%20%2824%29-ZBaqxyFQ2i0DySyAZgMxH0YALea3VK.webp",
    growthLevel: 50,
    specialties: ["Cardiology", "Neurology", "Oncology", "Endocrinology"],
    isCustomizable: true,
  },
  {
    id: "wellness-coach",
    name: "", // User customizable
    gender: "neutral",
    role: "Wellness & Lifestyle Coach",
    description: "Holistic wellness expert focusing on lifestyle and preventive care",
    dataAccess: ["fitness_data", "nutrition", "sleep_patterns", "stress_levels"],
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img%20%2824%29-ZBaqxyFQ2i0DySyAZgMxH0YALea3VK.webp",
    videoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img%20%2824%29-ZBaqxyFQ2i0DySyAZgMxH0YALea3VK.webp",
    growthLevel: 25,
    specialties: ["Nutrition", "Fitness", "Mental Health", "Sleep Optimization"],
    isCustomizable: true,
  },
]

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [characters, setCharacters] = useState<Character[]>(defaultCharacters)
  const [showCharacterSetup, setShowCharacterSetup] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lipSyncActive, setLipSyncActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen && !selectedCharacter) {
      setShowCharacterSetup(true)
    }
  }, [isOpen, selectedCharacter])

  const handleLipSync = (text: string) => {
    setLipSyncActive(true)
    if (videoRef.current && selectedCharacter?.videoUrl) {
      videoRef.current.play()
    }

    const duration = Math.max(2000, text.length * 50)
    setTimeout(() => {
      setLipSyncActive(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }, duration)
  }

  const updateCharacterGrowth = (characterId: string, interaction: string) => {
    setCharacters((prev) =>
      prev.map((char) => {
        if (char.id === characterId && char.isCustomizable) {
          const growthIncrease = interaction.length > 50 ? 2 : 1
          return {
            ...char,
            growthLevel: Math.min(100, char.growthLevel + growthIncrease),
          }
        }
        return char
      }),
    )
  }

  const handleCharacterCustomization = (characterId: string, updates: Partial<Character>) => {
    setCharacters((prev) => prev.map((char) => (char.id === characterId ? { ...char, ...updates } : char)))
  }

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setShowCharacterSetup(false)

    const introMessage: ChatMessage = {
      text:
        character.id === "ibn-sina"
          ? `السلام عليكم، أنا ابن سينا، طبيبكم وفيلسوفكم.\nPeace be upon you, I am Ibn Sina, your physician and philosopher.\n\nRole: ${character.role}\nSpecialties: ${character.specialties.join(", ")}\nData Access: I can access your ${character.dataAccess.join(", ")} to provide personalized care.`
          : `Hello! I am ${character.name || "your AI companion"}.\n\nRole: ${character.role}\nDescription: ${character.description}\nSpecialties: ${character.specialties.join(", ")}\nGrowth Level: ${character.growthLevel}/100\n\nI can access your ${character.dataAccess.join(", ")} to provide personalized assistance. How may I help you today?`,
      sender: "ai",
      timestamp: new Date(),
      characterId: character.id,
      emotion: "neutral",
    }

    setMessages([introMessage])
    handleLipSync(introMessage.text)
  }

  const handleSendMessage = async () => {
    if (input.trim() && selectedCharacter) {
      const userMessage: ChatMessage = {
        text: input,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            character: selectedCharacter,
            context: "telemedicine_assistant",
            language: "bilingual",
          }),
        })

        const data = await response.json()

        const aiMessage: ChatMessage = {
          text: data.response || "عذراً، حدث خطأ في الاتصال.\nSorry, there was a connection error.",
          sender: "ai",
          timestamp: new Date(),
          characterId: selectedCharacter.id,
          emotion: "speaking",
        }

        setMessages((prev) => [...prev, aiMessage])
        handleLipSync(aiMessage.text)
        updateCharacterGrowth(selectedCharacter.id, input)
      } catch (error) {
        console.error("Chat error:", error)
        const errorMessage: ChatMessage = {
          text: "عذراً، لا أستطيع الرد في الوقت الحالي.\nSorry, I cannot respond right now.",
          sender: "ai",
          timestamp: new Date(),
          characterId: selectedCharacter.id,
          emotion: "concerned",
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleVoiceInput = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = selectedCharacter?.id === "ibn-sina" ? "ar-EG" : "en-US"
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  if (showCharacterSetup) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            اختر مساعدك الذكي • Choose Your AI Companion
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="bg-gray-800 rounded-lg p-4 border border-emerald-500/30">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={character.avatar || "/placeholder.svg"}
                    alt={character.name || character.role}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div className="flex-1">
                    {character.isCustomizable ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter name..."
                          value={character.name}
                          onChange={(e) => handleCharacterCustomization(character.id, { name: e.target.value })}
                          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-emerald-500"
                        />
                        <select
                          value={character.gender}
                          onChange={(e) =>
                            handleCharacterCustomization(character.id, {
                              gender: e.target.value as "male" | "female" | "neutral",
                            })
                          }
                          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-emerald-500"
                        >
                          <option value="neutral">Neutral</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    ) : (
                      <h3 className="text-lg font-semibold text-white">{character.name}</h3>
                    )}
                    <p className="text-emerald-400 text-sm">{character.role}</p>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3">{character.description}</p>

                <div className="space-y-2 text-xs text-gray-400">
                  <div>
                    <strong>Specialties:</strong> {character.specialties.join(", ")}
                  </div>
                  <div>
                    <strong>Data Access:</strong> {character.dataAccess.join(", ")}
                  </div>
                  <div>
                    <strong>Growth Level:</strong> {character.growthLevel}/100
                  </div>
                </div>

                <button
                  onClick={() => selectCharacter(character)}
                  disabled={character.isCustomizable && !character.name}
                  className="w-full mt-4 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select {character.name || character.role}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-6 w-full p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full p-4 shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="h-8 w-8" />
        </button>
      )}

      {isOpen && selectedCharacter && (
        <div className="bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl w-96 h-[600px] flex flex-col border border-emerald-500/30">
          <div className="flex justify-between items-center p-4 border-b border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={selectedCharacter.avatar || "/placeholder.svg"}
                  alt={selectedCharacter.name || selectedCharacter.role}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
                {lipSyncActive && selectedCharacter.videoUrl && (
                  <video
                    ref={videoRef}
                    src={selectedCharacter.videoUrl}
                    className="absolute inset-0 w-12 h-12 rounded-full object-cover opacity-80"
                    muted
                    loop
                  />
                )}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${lipSyncActive ? "bg-green-500 animate-pulse" : "bg-emerald-500"}`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedCharacter.name || selectedCharacter.role}</h3>
                <p className="text-sm text-emerald-300">Level {selectedCharacter.growthLevel}/100</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedCharacter(null)}
                className="text-gray-300 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
              >
                Switch
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white text-2xl leading-none">
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-gray-800">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                      : selectedCharacter.id === "ibn-sina"
                        ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-gray-100 border border-amber-500/30"
                        : "bg-gray-700/80 text-gray-100 border border-emerald-500/20"
                  }`}
                  style={{ direction: msg.text.includes("ا") ? "rtl" : "ltr" }}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div
                    className={`text-xs mt-1 opacity-70 ${msg.sender === "user" ? "text-emerald-100" : "text-gray-400"}`}
                  >
                    {msg.timestamp.toLocaleTimeString("ar-EG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700/80 text-gray-100 border border-emerald-500/20 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-emerald-500/30 bg-gray-800/50">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder={
                  selectedCharacter.id === "ibn-sina" ? "اكتب رسالتك... Type your message..." : "Type your message..."
                }
                className="flex-1 p-3 rounded-lg bg-gray-700/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-600"
                dir="auto"
              />

              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
