"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, Download, Trash2, Search } from "lucide-react"
import Link from "next/link"

interface Memory {
  id: string
  content: string
  timestamp: Date
  type: "conversation" | "task" | "insight" | "learning" | "document"
}

interface Task {
  id: string
  title: string
  completed: boolean
  priority: "low" | "medium" | "high"
  createdAt: Date
}

interface AIIntegration {
  name: string
  connected: boolean
  apiKey?: string
  lastSync?: Date
}

export default function AIDirectory() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [integrations, setIntegrations] = useState<AIIntegration[]>([
    { name: "GensPark", connected: false },
    { name: "Perplexity", connected: false },
    { name: "Claude", connected: false },
    { name: "Gemini", connected: false },
    { name: "Character.AI", connected: false },
    { name: "Manus", connected: false },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [newDocument, setNewDocument] = useState("")
  const [activeTab, setActiveTab] = useState<"memories" | "tasks" | "integrations" | "documents">("memories")

  useEffect(() => {
    const savedMemories = localStorage.getItem("ai-companion-memories")
    const savedTasks = localStorage.getItem("ai-companion-tasks")
    const savedIntegrations = localStorage.getItem("ai-companion-integrations")

    if (savedMemories) setMemories(JSON.parse(savedMemories))
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedIntegrations) setIntegrations(JSON.parse(savedIntegrations))
  }, [])

  const addDocument = () => {
    if (!newDocument.trim()) return

    const newMemory: Memory = {
      id: Date.now().toString(),
      content: newDocument,
      timestamp: new Date(),
      type: "document",
    }

    const updatedMemories = [newMemory, ...memories]
    setMemories(updatedMemories)
    localStorage.setItem("ai-companion-memories", JSON.stringify(updatedMemories))
    setNewDocument("")
  }

  const deleteMemory = (id: string) => {
    const updatedMemories = memories.filter((m) => m.id !== id)
    setMemories(updatedMemories)
    localStorage.setItem("ai-companion-memories", JSON.stringify(updatedMemories))
  }

  const exportData = () => {
    const data = {
      memories,
      tasks,
      integrations,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-companion-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  const filteredMemories = memories.filter((memory) => memory.content.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to AI
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">AI Directory</h1>
          </div>

          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "memories", label: "Memories & Documents" },
            { key: "tasks", label: "Tasks" },
            { key: "integrations", label: "AI Connections" },
          ].map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "memories" && (
          <div className="space-y-6">
            {/* Add Document */}
            <Card>
              <CardHeader>
                <CardTitle>Add Knowledge/Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste documents, notes, or knowledge for the AI to learn from..."
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  rows={4}
                />
                <Button onClick={addDocument} disabled={!newDocument.trim()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Add to Knowledge Base
                </Button>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search memories and documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Memories List */}
            <Card>
              <CardHeader>
                <CardTitle>Stored Memories ({filteredMemories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredMemories.map((memory) => (
                    <div key={memory.id} className="flex items-start justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{memory.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(memory.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{memory.content}</p>
                      </div>
                      <Button onClick={() => deleteMemory(memory.id)} variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {filteredMemories.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No memories found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "tasks" && (
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {
                        const updatedTasks = tasks.map((t) =>
                          t.id === task.id ? { ...t, completed: !t.completed } : t,
                        )
                        setTasks(updatedTasks)
                        localStorage.setItem("ai-companion-tasks", JSON.stringify(updatedTasks))
                      }}
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <div className="text-center text-muted-foreground py-8">No tasks yet</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "integrations" && (
          <Card>
            <CardHeader>
              <CardTitle>AI Team Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {integration.connected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                    <Badge variant={integration.connected ? "default" : "secondary"}>
                      {integration.connected ? "Online" : "Offline"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
