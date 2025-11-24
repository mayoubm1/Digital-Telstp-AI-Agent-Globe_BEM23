"use client"

import { useState } from "react"
import { MessageCircle, Send } from "lucide-react"

interface ChatMessage {
  text: string
  sender: "user" | "ai"
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hello! How can I help you with the Global Life Sciences Hub?", sender: "ai" },
  ])
  const [input, setInput] = useState("")

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, sender: "user" as const }]
      setMessages(newMessages)
      setInput("")

      // Simulate AI response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "I am an AI assistant for the TELsTP Life Sciences Hub. I can provide information about telemedicine, life science hubs, collaboration opportunities, and medical assistance in both Arabic and English.",
            sender: "ai",
          },
        ])
      }, 1000)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white rounded-full p-4 shadow-lg hover:bg-emerald-700 transition-colors"
        >
          <MessageCircle className="h-8 w-8" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl w-80 h-96 flex flex-col border border-white/20">
          <div className="flex justify-between items-center p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white">AI Medical Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white text-xl">
              &times;
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === "user" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/20 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
