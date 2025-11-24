"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Character {
  id: string
  name: string
  title: string
  specialty: string
  description: string
  avatar: string
  personality: string[]
  languages: string[]
  expertise: string[]
}

const characters: Character[] = [
  {
    id: "ibn-sina",
    name: "Ibn Sina",
    title: "The Great Physician",
    specialty: "Medical & Health Guidance",
    description:
      "Historical Islamic physician and philosopher, expert in medicine, healing, and holistic health approaches.",
    avatar: "👨‍⚕️",
    personality: ["Wise", "Compassionate", "Methodical", "Spiritual"],
    languages: ["Arabic", "English"],
    expertise: ["Medicine", "Philosophy", "Healing", "Islamic Health Principles"],
  },
  {
    id: "business-advisor",
    name: "Khalil Al-Tijari",
    title: "Business Strategist",
    specialty: "Business Development & Strategy",
    description:
      "Expert in business planning, market analysis, entrepreneurship, and strategic development for MENA region.",
    avatar: "👔",
    personality: ["Strategic", "Analytical", "Results-driven", "Innovative"],
    languages: ["Arabic", "English"],
    expertise: ["Business Planning", "Market Analysis", "Entrepreneurship", "Strategic Development"],
  },
  {
    id: "spiritual-guide",
    name: "Sheikh Noor",
    title: "Spiritual Counselor",
    specialty: "Islamic Guidance & Spirituality",
    description:
      "Knowledgeable in Islamic principles, Quran, Hadith, and providing spiritual guidance and moral support.",
    avatar: "🕌",
    personality: ["Patient", "Understanding", "Knowledgeable", "Peaceful"],
    languages: ["Arabic", "English"],
    expertise: ["Quran", "Hadith", "Islamic Jurisprudence", "Spiritual Counseling"],
  },
  {
    id: "tech-innovator",
    name: "Dr. Amira Tech",
    title: "Technology Pioneer",
    specialty: "AI & Technology Innovation",
    description:
      "Expert in artificial intelligence, technology trends, digital transformation, and innovation strategies.",
    avatar: "🤖",
    personality: ["Curious", "Forward-thinking", "Logical", "Creative"],
    languages: ["Arabic", "English"],
    expertise: ["Artificial Intelligence", "Machine Learning", "Digital Innovation", "Tech Strategy"],
  },
  {
    id: "life-coach",
    name: "Yasmin Al-Hayat",
    title: "Life Coach",
    specialty: "Personal Development & Wellness",
    description:
      "Specialist in personal growth, mental wellness, goal setting, and life balance with cultural sensitivity.",
    avatar: "🌟",
    personality: ["Encouraging", "Empathetic", "Motivational", "Balanced"],
    languages: ["Arabic", "English"],
    expertise: ["Personal Development", "Goal Setting", "Mental Wellness", "Life Balance"],
  },
  {
    id: "research-scientist",
    name: "Dr. Omar Research",
    title: "Research Scientist",
    specialty: "Scientific Research & Analysis",
    description:
      "Expert in life sciences, research methodologies, data analysis, and scientific innovation for TELsTP.",
    avatar: "🔬",
    personality: ["Methodical", "Precise", "Inquisitive", "Evidence-based"],
    languages: ["Arabic", "English"],
    expertise: ["Life Sciences", "Research Methods", "Data Analysis", "Scientific Innovation"],
  },
]

interface CharacterSelectorProps {
  selectedCharacter: Character | null
  onCharacterSelect: (character: Character) => void
}

export default function CharacterSelector({ selectedCharacter, onCharacterSelect }: CharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="mb-4 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
      >
        {selectedCharacter ? (
          <span className="flex items-center gap-2">
            <span className="text-lg">{selectedCharacter.avatar}</span>
            {selectedCharacter.name}
          </span>
        ) : (
          "Select AI Character"
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 p-4 bg-white border-emerald-200 shadow-lg max-h-96 overflow-y-auto">
          <div className="grid gap-3">
            {characters.map((character) => (
              <div
                key={character.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-emerald-50 ${
                  selectedCharacter?.id === character.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                }`}
                onClick={() => {
                  onCharacterSelect(character)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{character.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{character.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {character.specialty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {character.expertise.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export { characters }
