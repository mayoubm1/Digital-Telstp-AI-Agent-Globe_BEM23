"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Settings } from "lucide-react"
import CharacterSelector, { type Character, characters } from "./character-selector"

interface MultiCharacterAvatarProps {
  onDirectoryClick: () => void
}

export default function MultiCharacterAvatar({ onDirectoryClick }: MultiCharacterAvatarProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0])
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [currentMood, setCurrentMood] = useState<"neutral" | "speaking" | "listening" | "thinking">("neutral")

  // Character-specific responses
  const getCharacterResponse = (character: Character, input: string) => {
    const responses = {
      "ibn-sina": [
        "السلام عليكم، كيف يمكنني مساعدتك في صحتك اليوم؟",
        "الصحة تاج على رؤوس الأصحاء، دعني أساعدك في الحفاظ عليها",
        "في الطب، الوقاية خير من العلاج",
      ],
      "business-advisor": [
        "Let's analyze your business strategy and find opportunities for growth",
        "Success in business requires planning, execution, and adaptation",
        "What business challenge can I help you solve today?",
      ],
      "spiritual-guide": [
        "بسم الله، كيف يمكنني أن أرشدك روحياً اليوم؟",
        "الإيمان والعمل الصالح أساس السعادة في الدنيا والآخرة",
        "دعنا نتأمل في حكمة القرآن والسنة",
      ],
      "tech-innovator": [
        "Technology is reshaping our world. How can we innovate together?",
        "AI and machine learning offer endless possibilities for advancement",
        "Let's explore the future of technology and its applications",
      ],
      "life-coach": [
        "Every challenge is an opportunity for growth. How can I support you?",
        "Balance and mindfulness are keys to a fulfilling life",
        "What goals would you like to work on today?",
      ],
      "research-scientist": [
        "Scientific inquiry leads to breakthrough discoveries",
        "Let's examine the evidence and draw meaningful conclusions",
        "Research methodology is crucial for valid results",
      ],
    }

    const characterResponses = responses[character.id as keyof typeof responses] || responses["ibn-sina"]
    return characterResponses[Math.floor(Math.random() * characterResponses.length)]
  }

  // Voice activation
  useEffect(() => {
    if (isListening) {
      setCurrentMood("listening")
      // Simulate processing
      const timer = setTimeout(() => {
        setIsThinking(true)
        setCurrentMood("thinking")

        setTimeout(() => {
          setCurrentMood("speaking")
          const response = getCharacterResponse(selectedCharacter, "user input")

          // Text-to-speech
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(response)
            utterance.lang = selectedCharacter.languages.includes("Arabic") ? "ar-SA" : "en-US"
            utterance.rate = 0.9
            utterance.pitch = 1.0

            utterance.onend = () => {
              setCurrentMood("neutral")
              setIsThinking(false)
              setIsListening(false)
            }

            speechSynthesis.speak(utterance)
          } else {
            setTimeout(() => {
              setCurrentMood("neutral")
              setIsThinking(false)
              setIsListening(false)
            }, 2000)
          }
        }, 1000)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isListening, selectedCharacter])

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      setCurrentMood("neutral")
    } else {
      setIsListening(true)
    }
  }

  // Character-specific avatar styling
  const getAvatarStyle = () => {
    const baseStyle = "w-64 h-64 rounded-full border-4 transition-all duration-300 object-cover"

    switch (currentMood) {
      case "listening":
        return `${baseStyle} border-blue-400 shadow-lg shadow-blue-200 scale-105`
      case "thinking":
        return `${baseStyle} border-yellow-400 shadow-lg shadow-yellow-200 scale-105`
      case "speaking":
        return `${baseStyle} border-emerald-400 shadow-lg shadow-emerald-200 scale-105`
      default:
        return `${baseStyle} border-emerald-300 shadow-md`
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4">
      {/* Character Selector */}
      <div className="mb-6">
        <CharacterSelector selectedCharacter={selectedCharacter} onCharacterSelect={setSelectedCharacter} />
      </div>

      {/* Character Info */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{selectedCharacter.name}</h1>
        <p className="text-emerald-200 text-lg mb-1">{selectedCharacter.title}</p>
        <p className="text-gray-300 text-sm max-w-md">{selectedCharacter.description}</p>
      </div>

      {/* Avatar */}
      <div className="relative mb-8">
        <div className={getAvatarStyle()}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-8xl">{selectedCharacter.avatar}</span>
          </div>
        </div>

        {/* Microphone Button */}
        <Button
          onClick={toggleListening}
          className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full transition-all duration-300 ${
            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-emerald-500 hover:bg-emerald-600"
          }`}
          disabled={isThinking}
        >
          {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </Button>
      </div>

      {/* Status */}
      <div className="text-center mb-8">
        <p className="text-white text-lg">
          {currentMood === "listening" && "Listening..."}
          {currentMood === "thinking" && "Processing..."}
          {currentMood === "speaking" && "Speaking..."}
          {currentMood === "neutral" && `Ready to help with ${selectedCharacter.specialty}`}
        </p>
      </div>

      {/* Directory Access */}
      <Button
        onClick={onDirectoryClick}
        variant="outline"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <Settings className="w-4 h-4 mr-2" />
        AI Directory
      </Button>

      {/* Character Expertise */}
      <div className="mt-8 text-center">
        <p className="text-gray-300 text-sm mb-2">Expertise:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {selectedCharacter.expertise.map((skill) => (
            <span key={skill} className="px-3 py-1 bg-emerald-600/30 text-emerald-200 rounded-full text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
