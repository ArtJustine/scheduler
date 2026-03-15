import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getServerDb } from "@/lib/firebase-server"
import { collection, query, where, getDocs, doc, setDoc, Timestamp } from "firebase/firestore"
import config from "@/lib/config"

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  
  // Verify cron secret if provided, otherwise allow for development
  if (config.app.environment === "production" && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getServerDb()
  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
  }

  try {
    // Get all users who have a niche defined
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("niche", "!=", ""))
    const querySnapshot = await getDocs(q)
    
    const results = []

    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data()
      const userId = userDoc.id
      const niche = userData.niche

      if (!niche) continue

      // Generate trends using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const competitors = userData.trendCompetitors || []
      const competitorContext = competitors.length > 0 
        ? `Specifically look at these competitors/references for inspiration and comparison: ${competitors.join(", ")}.`
        : ""

      const prompt = `
        You are an expert social media strategist. 
        Analyze the current trends for the niche: "${niche}".
        ${competitorContext}
        Focus on what's getting high engagement on TikTok, Instagram, and YouTube.
        
        Provide a JSON response with the following structure:
        {
          "trends": [
            {
              "title": "Trend Title",
              "description": "Brief description of the trend",
              "engagementType": "High Likes/Shares/Comments",
              "platform": "TikTok/Instagram/YouTube",
              "exampleTopics": ["Topic 1", "Topic 2"],
              "strategy": "How to capitalize on this"
            }
          ],
          "topCompetitors": [
             { "name": "Channel/Account Name", "platform": "Platform", "reason": "Why they are trending" }
          ],
          "suggestedKeywords": ["keyword1", "keyword2"]
        }
        
        Return ONLY the JSON. No Markdown formatting, no code blocks.
      `

      const result = await model.generateContent(prompt)
      const responseText = result.response.text().trim()
      
      // Attempt to parse JSON. Sometimes AI wraps in code blocks.
      let trendsData
      try {
        const cleanJson = responseText.replace(/```json|```/g, "").trim()
        trendsData = JSON.parse(cleanJson)
      } catch (e) {
        console.error(`Failed to parse Gemini response for user ${userId}:`, responseText)
        continue
      }

      // Store in Firestore
      const trendsRef = doc(db, "trends", userId)
      await setDoc(trendsRef, {
        userId,
        niche,
        ...trendsData,
        lastSyncedAt: Timestamp.now(),
        nextSyncAt: getNextMonday()
      }, { merge: true })

      results.push({ userId, status: "success" })
    }

    return NextResponse.json({ success: true, processed: results.length })
  } catch (error: any) {
    console.error("Trends sync error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getNextMonday() {
  const d = new Date()
  d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7 || 7)
  d.setHours(0, 0, 0, 0)
  return Timestamp.fromDate(d)
}
