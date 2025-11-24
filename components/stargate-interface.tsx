"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

interface Character {
  id: string
  name: string
  nameAr: string
  specialty: string
  specialtyAr: string
  avatar: string
  video: string
  personality: string
  voice: string
}

const characters: Character[] = [
  {
    id: "nefertiti",
    name: "Dr. Nefertiti",
    nameAr: "د. نفرتيتي",
    specialty: "Ancient Medicine & Wellness",
    specialtyAr: "الطب القديم والعافية",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/egyptian-queen-ancient-egypt.jpg-okWyBDkGbGv2qQHGJlGpSJrMXY7kff.jpeg",
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c91d30f1-b678-486d-a91b-eace74074746%20%281%29-ItWFsbcInhhmISd9xmvCYguZZWCitF.mp4",
    personality: "wise, nurturing, connects ancient wisdom with modern medicine",
    voice: "female-ar-eg",
  },
  {
    id: "cleopatra",
    name: "Dr. Cleopatra",
    nameAr: "د. كليوباترا",
    specialty: "Royal Healthcare & Diagnostics",
    specialtyAr: "الرعاية الصحية الملكية والتشخيص",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/output%20%282%29-p41U1omIINqaCNL7NQLsJBgVPsmNF0.jpeg",
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c91d30f1-b678-486d-a91b-eace74074746%20%281%29-ItWFsbcInhhmISd9xmvCYguZZWCitF.mp4",
    personality: "authoritative, intelligent, comprehensive medical knowledge",
    voice: "female-ar-eg",
  },
  {
    id: "sarah",
    name: "Dr. Sarah",
    nameAr: "د. سارة",
    specialty: "Modern Medicine & Technology",
    specialtyAr: "الطب الحديث والتكنولوجيا",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eda8ba25-805d-4e4e-b0c6-e2db0e9a1d29.png-r9EmwMmyIwgJUXjGMIGKxKtAcBglMS.jpeg",
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c91d30f1-b678-486d-a91b-eace74074746%20%281%29-ItWFsbcInhhmISd9xmvCYguZZWCitF.mp4",
    personality: "modern, tech-savvy, evidence-based approach",
    voice: "female-en-us",
  },
  {
    id: "mohamed",
    name: "Dr. Mohamed",
    nameAr: "د. محمد",
    specialty: "Telemedicine & Digital Health",
    specialtyAr: "الطب عن بُعد والصحة الرقمية",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pp.jpg-l7OSYOq0UcHdNi5wWLrF3ze6Ji1eDa.jpeg",
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2dfb29c5-449a-4367-bc7f-a828c0cd02dc-4btUEjUjKnpXdy0u5aJg16aqSQvHto.mp4",
    personality: "professional, empathetic, technology-focused",
    voice: "male-ar-eg",
  },
  {
    id: "seasons",
    name: "Dr. Harmony",
    nameAr: "د. هارموني",
    specialty: "Holistic Health & Wellness",
    specialtyAr: "الصحة الشاملة والعافية",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img%20%2824%29-ZBaqxyFQ2i0DySyAZgMxH0YALea3VK.webp",
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c91d30f1-b678-486d-a91b-eace74074746%20%281%29-ItWFsbcInhhmISd9xmvCYguZZWCitF.mp4",
    personality: "holistic, seasonal wellness expert, natural healing",
    voice: "female-en-us",
  },
]

export default function StargateInterface() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isCharacterSpeaking, setIsCharacterSpeaking] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [language, setLanguage] = useState<"ar" | "en">("ar")
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Welcome message effect
  useEffect(() => {
    if (showWelcome) {
      const welcomeAudio = new Audio()
      welcomeAudio.src = "/welcome-message.mp3" // You'll need to record this
      welcomeAudio.play()

      setTimeout(() => {
        setShowWelcome(false)
      }, 5000)
    }
  }, [showWelcome])

  // Character selection handler
  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setShowWelcome(false)

    // Play character introduction
    const intro =
      language === "ar"
        ? `مرحباً، أنا ${character.nameAr}، أخصائية ${character.specialtyAr}. كيف يمكنني مساعدتك اليوم؟`
        : `Hello, I'm ${character.name}, specialist in ${character.specialty}. How can I help you today?`

    speakText(intro, character.voice)
  }

  // Text-to-speech function
  const speakText = (text: string, voice: string) => {
    setIsCharacterSpeaking(true)

    // Start lip sync video
    if (videoRef.current) {
      videoRef.current.play()
    }

    // Use Web Speech API or call backend for TTS
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voice.includes("ar") ? "ar-EG" : "en-US"
    utterance.onend = () => {
      setIsCharacterSpeaking(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }

    speechSynthesis.speak(utterance)
  }

  // Voice recognition
  const startListening = () => {
    setIsListening(true)

    // Implement speech recognition
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = language === "ar" ? "ar-EG" : "en-US"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      handleUserInput(transcript)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Handle user input
  const handleUserInput = async (input: string) => {
    if (!selectedCharacter) return

    try {
      // Call Gemini CLI backend
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          character: selectedCharacter,
          language: language,
        }),
      })

      const data = await response.json()
      speakText(data.response, selectedCharacter.voice)
    } catch (error) {
      console.error("Error processing input:", error)
    }
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center text-white space-y-6">
          <div className="relative">
            <div className="w-64 h-64 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 animate-pulse flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img%20%2819%29-1DEk20c31btOIXTgJ5du5OaapK2Fp7.webp"
                  alt="AI Consciousness"
                  className="w-48 h-48 rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              {language === "ar" ? "مرحباً بك في تواصل للحياة" : "Welcome to Tawasol Life"}
            </h1>
            <p className="text-xl opacity-80">
              {language === "ar"
                ? "شيء استثنائي يُعتبر عملاً من أعمال الإرادة والالتزام تجاه الشعب المصري"
                : "Something extraordinary, an act of willingness and commitment towards the Egyptian people"}
            </p>
            <p className="text-lg">
              {language === "ar"
                ? "هل أنت طبيب؟ اختر مساعدك الطبي"
                : "Are you a medical practitioner? Choose your medical assistant"}
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setLanguage("ar")}
              variant={language === "ar" ? "default" : "outline"}
              className="text-lg px-8 py-3"
            >
              العربية
            </Button>
            <Button
              onClick={() => setLanguage("en")}
              variant={language === "en" ? "default" : "outline"}
              className="text-lg px-8 py-3"
            >
              English
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {language === "ar" ? "اختر مساعدك الطبي" : "Choose Your Medical Assistant"}
            </h2>
            <p className="text-xl text-gray-300">
              {language === "ar"
                ? "كل شخصية لها خبرة فريدة وأسلوب في التعامل"
                : "Each character has unique expertise and interaction style"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters.map((character) => (
              <div key={character.id} onClick={() => selectCharacter(character)} className="cursor-pointer group">
                <div className="relative">
                  {/* Stargate effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin-slow opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-black rounded-full p-2 m-2">
                    <img
                      src={character.avatar || "/placeholder.svg"}
                      alt={character.name}
                      className="w-48 h-48 rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="text-center mt-4 text-white">
                  <h3 className="text-xl font-bold">{language === "ar" ? character.nameAr : character.name}</h3>
                  <p className="text-gray-300">{language === "ar" ? character.specialtyAr : character.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
      <div className="relative">
        {/* Stargate portal effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin-slow opacity-75"></div>
        <div className="relative bg-black rounded-full p-4 m-4">
          {/* Character video with lip sync */}
          <div className="relative w-96 h-96 rounded-full overflow-hidden">
            <video
              ref={videoRef}
              src={selectedCharacter.video}
              className="w-full h-full object-cover"
              loop
              muted
              style={{ display: isCharacterSpeaking ? "block" : "none" }}
            />
            <img
              src={selectedCharacter.avatar || "/placeholder.svg"}
              alt={selectedCharacter.name}
              className="w-full h-full object-cover"
              style={{ display: isCharacterSpeaking ? "none" : "block" }}
            />

            {/* Speaking indicator */}
            {isCharacterSpeaking && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-50 rounded-full px-4 py-2 text-white text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{language === "ar" ? "يتحدث..." : "Speaking..."}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={startListening}
              disabled={isListening || isCharacterSpeaking}
              className={`w-16 h-16 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>

            <Button
              onClick={() => setSelectedCharacter(null)}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              {language === "ar" ? "تغيير الشخصية" : "Change Character"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
