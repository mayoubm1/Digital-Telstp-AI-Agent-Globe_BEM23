# Mistral AI Setup Guide

## Overview

The TELsTP AI Medical Assistant now uses Mistral AI for advanced language processing with specialized medical and cultural knowledge.

## API Configuration

1. **API Key**: Already configured in `.env.local`
   \`\`\`
   MISTRAL_API_KEY=0d2xZ6Nbczykp0WsoiE5QgmN5s8kruwn
   \`\`\`

2. **Model**: Using `mistral-large-latest` for optimal performance

## Features

- **Multi-character AI personas** with specialized medical knowledge
- **Bilingual support** (Arabic/English) for MENA region
- **Cultural sensitivity** for Islamic medical practices
- **Real-time responses** with proper medical terminology
- **Cost-effective** API usage with intelligent fallbacks

## Character Personas

1. **Ibn Sina (Avicenna)** - Islamic physician and philosopher
2. **Khalil Al-Tijari** - Business strategist for MENA markets
3. **Sheikh Noor** - Islamic spiritual counselor
4. **Dr. Amira Tech** - AI and technology innovation expert
5. **Yasmin Al-Hayat** - Personal wellness specialist
6. **Dr. Omar Research** - Life sciences researcher

## API Endpoints

- `POST /api/ai-chat` - Main chat interface with character selection
- Supports actions: chat, web_search, analyze_data, process_file

## Usage Example

\`\`\`javascript
const response = await fetch('/api/ai-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What are the benefits of traditional Islamic medicine?",
    character: "ibn-sina",
    sessionId: "user_session_123"
  })
})
\`\`\`

## Error Handling

The system includes intelligent fallbacks:
- If Mistral API is unavailable, uses pre-configured responses
- Maintains conversation flow even during API issues
- Logs errors for monitoring and improvement

## Security

- API key stored securely in environment variables
- No sensitive data logged or transmitted
- Compliant with medical data privacy standards
