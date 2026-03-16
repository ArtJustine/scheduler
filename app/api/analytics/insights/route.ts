import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import config from "@/lib/config"

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

export async function POST(req: NextRequest) {
  try {
    const { stats, platform } = await req.json()

    if (!stats) {
      return NextResponse.json({ error: "No stats provided" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      You are an expert social media data analyst. 
      Analyze the following social media performance data for ${platform === "all" ? "all platforms" : platform}:
      
      ${JSON.stringify(stats, null, 2)}
      
      Provide 3 actionable, highly helpful insights to the content creator. 
      Each insight should include:
      1. A catchy title
      2. The observation (what the data shows)
      3. The recommendation (what they should do next)
      
      Format the response as a JSON array of objects:
      [
        { "title": "...", "observation": "...", "recommendation": "...", "type": "info|success|warning" }
      ]
      
      Return ONLY the JSON. No markdown formatting.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()
    
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim()
      const insights = JSON.parse(cleanJson)
      return NextResponse.json(insights)
    } catch (e) {
      console.error("Failed to parse AI response:", responseText)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("AI Insights error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
