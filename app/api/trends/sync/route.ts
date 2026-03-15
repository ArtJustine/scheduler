import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { adminDb } from "@/lib/firebase-admin"
import config from "@/lib/config"
import { Timestamp } from "firebase-admin/firestore"

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userIdParam = searchParams.get("userId")
  const authHeader = req.headers.get("authorization")
  
  // Verify cron secret if provided and not a specific user request
  if (!userIdParam && config.app.environment === "production" && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Admin Database not initialized" }, { status: 500 })
  }

  try {
    let userDataList: any[] = []

    if (userIdParam) {
      // Manual sync for a specific user using admin SDK to bypass client rules
      const userRef = adminDb.collection("users").doc(userIdParam)
      const userSnap = await userRef.get()
      if (userSnap.exists) {
        userDataList.push({ id: userSnap.id, ...userSnap.data() })
      }
    } else {
      // Batch sync (Cron) - using admin SDK
      const usersRef = adminDb.collection("users")
      
      // Get users with niche
      const nicheSnapshot = await usersRef.where("niche", ">", "").get()
      
      // Get users with competitors
      const compSnapshot = await usersRef.where("trendCompetitors", "!=", []).get()
      
      // Merge results
      const userIds = new Set()
      nicheSnapshot.forEach(doc => {
        userIds.add(doc.id)
        userDataList.push({ id: doc.id, ...doc.data() })
      })
      compSnapshot.forEach(doc => {
        if (!userIds.has(doc.id)) {
          userDataList.push({ id: doc.id, ...doc.data() })
        }
      })
    }
    
    const results = []

    for (const userData of userDataList) {
      const userId = userData.id
      const niche = userData.niche || "General Content Creation"
      const competitors = userData.trendCompetitors || []

      if (!userData.niche && competitors.length === 0) continue

      // Generate trends using AI
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })
      
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
        
        Return ONLY the JSON. No Markdown formatting, no code blocks (no \`\`\`json).
      `

      const result = await model.generateContent(prompt)
      const responseText = result.response.text().trim()
      
      let trendsData
      try {
        const cleanJson = responseText.replace(/```json|```/g, "").trim()
        trendsData = JSON.parse(cleanJson)
      } catch (e) {
        console.error(`Failed to parse AI response for user ${userId}:`, responseText)
        continue
      }

      // Store in Firestore using admin SDK
      const trendsRef = adminDb.collection("trends").doc(userId)
      await trendsRef.set({
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
