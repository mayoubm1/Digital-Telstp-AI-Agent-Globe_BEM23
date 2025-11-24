// Client library for interfacing with your AI backend
export class AIClient {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  async chat(message: string, character = "ibn-sina", sessionId?: string, userId = "mayo") {
    const response = await fetch(`${this.baseUrl}/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, character, sessionId, userId }),
    })
    return response.json()
  }

  async getMemories(sessionId: string, type = "short_term") {
    const response = await fetch(`${this.baseUrl}/memory?sessionId=${sessionId}&type=${type}`)
    return response.json()
  }

  async storeMemory(sessionId: string, contextType: string, content: string, metadata?: any) {
    const response = await fetch(`${this.baseUrl}/memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, contextType, content, metadata }),
    })
    return response.json()
  }

  async searchKnowledge(query?: string, category?: string) {
    const params = new URLSearchParams()
    if (query) params.append("search", query)
    if (category) params.append("category", category)

    const response = await fetch(`${this.baseUrl}/knowledge?${params}`)
    return response.json()
  }

  async getConnections() {
    const response = await fetch(`${this.baseUrl}/connections`)
    return response.json()
  }

  async sendToTeamMember(peerUri: string, message: string) {
    const response = await fetch(`${this.baseUrl}/connections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peer_uri: peerUri, message }),
    })
    return response.json()
  }

  async searchWeb(query: string) {
    const response = await fetch(`${this.baseUrl}/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Search the web for: ${query}`,
        character: "research-scientist",
        action: "web_search",
      }),
    })
    return response.json()
  }

  async analyzeData(dataDescription: string, analysisType = "general") {
    const response = await fetch(`${this.baseUrl}/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Analyze this data: ${dataDescription}`,
        character: "research-scientist",
        action: "analyze_data",
        analysisType,
      }),
    })
    return response.json()
  }

  async processFile(filePath: string, task: string) {
    const response = await fetch(`${this.baseUrl}/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Process file: ${filePath} with task: ${task}`,
        character: "research-scientist",
        action: "process_file",
        filePath,
        task,
      }),
    })
    return response.json()
  }
}

export const aiClient = new AIClient()
