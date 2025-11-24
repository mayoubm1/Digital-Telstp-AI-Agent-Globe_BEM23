"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AutomationWorkflowsProps {
  isOpen: boolean
  onClose: () => void
}

export function AutomationWorkflows({ isOpen, onClose }: AutomationWorkflowsProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runTranslation = async (text: string, languages: string[]) => {
    setLoading(true)
    try {
      const response = await fetch("/api/automation/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguages: languages }),
      })
      const data = await response.json()
      setResults(data.translations)
    } catch (error) {
      console.error("Translation error:", error)
    }
    setLoading(false)
  }

  const runProposalGeneration = async (proposalData: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/automation/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      })
      const data = await response.json()
      setResults(data.proposal)
    } catch (error) {
      console.error("Proposal generation error:", error)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">No-Code AI Automation Workflows</h2>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        <Tabs defaultValue="translation" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="translation">Translation</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="sheets">Sheets</TabsTrigger>
          </TabsList>

          <TabsContent value="translation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Language Translation</CardTitle>
                <CardDescription>Instantly translate text to multiple languages using GPT-4</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Enter text to translate..." className="min-h-[100px]" />
                <div className="flex gap-2">
                  <Badge variant="secondary">Spanish</Badge>
                  <Badge variant="secondary">French</Badge>
                  <Badge variant="secondary">Arabic</Badge>
                  <Badge variant="secondary">German</Badge>
                </div>
                <Button
                  onClick={() => runTranslation("Sample text", ["Spanish", "French", "Arabic"])}
                  disabled={loading}
                >
                  {loading ? "Translating..." : "Translate"}
                </Button>
                {results && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(results).map(([lang, translation]) => (
                      <div key={lang} className="p-3 bg-gray-50 rounded">
                        <strong>{lang}:</strong> {translation as string}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Generation</CardTitle>
                <CardDescription>Generate customized project proposals automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Contact Person" />
                  <Input placeholder="Client Company" />
                  <Input placeholder="Company Type" />
                  <Input placeholder="CMS Platform" />
                  <Input placeholder="Number of Templates" />
                  <Input placeholder="Extra Features" />
                </div>
                <Button disabled={loading}>{loading ? "Generating..." : "Generate Proposal"}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Processing</CardTitle>
                <CardDescription>Automatically summarize emails and generate responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Paste email content here..." className="min-h-[150px]" />
                <Button disabled={loading}>{loading ? "Processing..." : "Process Email"}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Smart Calendar Management</CardTitle>
                <CardDescription>Automatically categorize calendar events as Personal or Business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Event Title" />
                <Textarea placeholder="Event Description" />
                <Button disabled={loading}>{loading ? "Categorizing..." : "Categorize Event"}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sheets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Google Sheets Integration</CardTitle>
                <CardDescription>Connect to Google Sheets for data automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Spreadsheet ID" />
                <Input placeholder="Range (e.g., A1:C10)" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Data</SelectItem>
                    <SelectItem value="write">Write Data</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled={loading}>{loading ? "Processing..." : "Execute"}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
