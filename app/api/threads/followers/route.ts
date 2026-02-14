import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, username, threadsId } = await request.json()
    let normalizedUsername = String(username || "").replace(/^@+/, "").trim()

    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 400 })
    }

    let followerCount = 0
    let postsCount = 0

    const tryUrls = [
      `https://graph.threads.net/v1.0/me?fields=id,username,follower_count,followers_count,media_count&access_token=${accessToken}`,
      `https://graph.threads.net/me?fields=id,username,follower_count,followers_count,media_count&access_token=${accessToken}`,
      `https://graph.threads.net/v1.0/me?fields=id,username,threads_follower_count,total_follower_count,media_count&access_token=${accessToken}`,
    ]

    for (const url of tryUrls) {
      try {
        const res = await fetch(url)
        if (!res.ok) continue
        const data = await res.json()

        const parsedFollowers = Number(
          data.follower_count ?? data.followers_count ?? data.threads_follower_count ?? data.total_follower_count ?? 0
        ) || 0
        const parsedPosts = Number(data.media_count ?? 0) || 0
        if (!normalizedUsername && data.username) {
          normalizedUsername = String(data.username).replace(/^@+/, "").trim()
        }

        followerCount = Math.max(followerCount, parsedFollowers)
        postsCount = Math.max(postsCount, parsedPosts)
      } catch {
        // Try next variation.
      }
    }

    if (followerCount === 0 && threadsId) {
      for (const metric of ["followers_count", "follower_count"]) {
        try {
          const insightsUrls = [
            `https://graph.threads.net/v1.0/${threadsId}/threads_insights?metric=${metric}&access_token=${accessToken}`,
            `https://graph.threads.net/v1.0/me/threads_insights?metric=${metric}&access_token=${accessToken}`,
          ]

          for (const insightsUrl of insightsUrls) {
            const insightsRes = await fetch(insightsUrl)
            if (!insightsRes.ok) continue

            const iData = await insightsRes.json()
            const val = iData?.data?.[0]?.total_value ?? iData?.data?.[0]?.values?.[0]?.value ?? 0
            followerCount = Math.max(followerCount, Number(val) || 0)
          }
        } catch {
          // Continue to next metric.
        }
      }
    }

    if (followerCount === 0 && normalizedUsername) {
      try {
        const lookupUrl = `https://graph.threads.net/v1.0/profile_lookup?username=${encodeURIComponent(normalizedUsername)}&fields=follower_count&access_token=${accessToken}`
        const lookupRes = await fetch(lookupUrl)
        if (lookupRes.ok) {
          const lData = await lookupRes.json()
          followerCount = Math.max(followerCount, Number(lData.follower_count ?? 0) || 0)
        }
      } catch {
        // Ignore lookup failures.
      }
    }

    // Final fallback: parse public Threads profile metadata.
    if (followerCount === 0 && normalizedUsername) {
      try {
        const profileRes = await fetch(`https://www.threads.net/@${encodeURIComponent(normalizedUsername)}`, {
          headers: { "User-Agent": "Mozilla/5.0" },
        })
        if (profileRes.ok) {
          const html = await profileRes.text()
          const match =
            html.match(/"follower_count"\s*:\s*(\d+)/) ||
            html.match(/"followers_count"\s*:\s*(\d+)/) ||
            html.match(/"followers"\s*:\s*(\d+)/)
          if (match?.[1]) {
            followerCount = Math.max(followerCount, Number(match[1]) || 0)
          }
        }
      } catch {
        // Ignore public profile fallback failures.
      }
    }

    return NextResponse.json({ followers: followerCount, posts: postsCount })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch Threads followers" },
      { status: 500 }
    )
  }
}
