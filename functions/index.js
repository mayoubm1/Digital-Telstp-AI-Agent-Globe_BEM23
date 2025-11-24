const functions = require("firebase-functions")
const admin = require("firebase-admin")
const express = require("express")
const cors = require("cors")
const { OpenAI } = require("openai")
const { google } = require("googleapis")

admin.initializeApp()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
})

// No-Code Automation Workflows
exports.automationWorkflows = functions.https.onRequest(app)

// Translation Workflow (Rob Howard's Use Case 1)
app.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguages } = req.body
    const translations = {}

    for (const lang of targetLanguages) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Translate to ${lang}: ${text}`,
          },
        ],
      })
      translations[lang] = completion.choices[0].message.content
    }

    res.json({ success: true, translations })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Proposal Generation (Rob Howard's Use Case 2)
app.post("/generate-proposal", async (req, res) => {
  try {
    const { contactPerson, clientCompany, companyType, cms, templates, features } = req.body

    const prompt = `Write a three-paragraph cover letter addressed to ${contactPerson}. Express your excitement for starting the new website project for ${clientCompany} and mention your firm's experience in the ${companyType} sector. Then, summarize the project, which includes design and development of a new website on the ${cms} content management system, with ${templates} unique page templates and the following extra features: ${features}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    })

    res.json({
      success: true,
      proposal: completion.choices[0].message.content,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Email Processing (Rob Howard's Use Case 3)
app.post("/process-email", async (req, res) => {
  try {
    const { emailContent } = req.body

    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Summarize the request the client is making in this email: ${emailContent}`,
        },
      ],
    })

    const responseCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Write a brief email response to the message below, letting the client know we are working on their request and suggesting anything the client might do to resolve the issue themselves: ${emailContent}`,
        },
      ],
    })

    res.json({
      success: true,
      summary: summaryCompletion.choices[0].message.content,
      suggestedResponse: responseCompletion.choices[0].message.content,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Calendar Categorization (Rob Howard's Use Case 5)
app.post("/categorize-event", async (req, res) => {
  try {
    const { eventTitle, eventDescription } = req.body

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Based on the title "${eventTitle}" and description "${eventDescription}" of this calendar event, is it more likely to be a Personal or Business event? Respond with only "Personal" or "Business"`,
        },
      ],
    })

    res.json({
      success: true,
      category: completion.choices[0].message.content.trim(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// AI Character Interaction
app.post("/character-chat", async (req, res) => {
  try {
    const { message, character, context } = req.body

    const characterPrompts = {
      "ibn-sina":
        "You are Ibn Sina (Avicenna), the great Islamic physician and philosopher. Respond with medical wisdom and Islamic principles.",
      "business-strategist": "You are Khalil Al-Tijari, a business strategy expert. Provide practical business advice.",
      "spiritual-counselor": "You are Sheikh Noor, a spiritual counselor. Offer guidance based on Islamic teachings.",
      "tech-innovator": "You are Dr. Amira Tech, an AI innovation expert. Discuss cutting-edge technology.",
      "life-coach": "You are Yasmin Al-Hayat, a life coach. Provide motivational and life guidance.",
      "research-scientist": "You are Dr. Omar Research, a scientific researcher. Share research insights.",
    }

    const systemPrompt = characterPrompts[character] || characterPrompts["ibn-sina"]

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    })

    res.json({
      success: true,
      response: completion.choices[0].message.content,
      character,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Google Sheets Integration
app.post("/sheets-automation", async (req, res) => {
  try {
    const { spreadsheetId, range, values, operation } = req.body

    const auth = new google.auth.GoogleAuth({
      keyFile: "path/to/service-account-key.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    let result
    if (operation === "read") {
      result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      })
    } else if (operation === "write") {
      result = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        resource: { values },
      })
    }

    res.json({ success: true, data: result.data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
