import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getServerDb } from "@/lib/firebase-server"
import { collection, query, where, getDocs, getDoc, doc, setDoc, Timestamp } from "firebase/firestore"
import config from "@/lib/config"

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

  const db = getServerDb()
  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
  }

  try {
    let userDataList: any[] = []

    if (userIdParam) {
      // Manual sync for a specific user
      const userRef = doc(db, "users", userIdParam)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        userDataList.push({ id: userSnap.id, ...userSnap.data() })
      }
    } else {
      // Batch sync (Cron) - get all users with niche or competitors
      const usersRef = collection(db, "users")
      const nicheQuery = query(usersRef, where("niche", "!=", ""))
      const nicheSnapshot = await getDocs(nicheQuery)
      
      const compQuery = query(usersRef, where("trendCompetitors", "!=", []))
      const compSnapshot = await getDocs(compQuery)
      
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
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
