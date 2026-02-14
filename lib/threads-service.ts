// lib/threads-service.ts
// Shared logic for fetching Threads analytics (followers, posts)

export interface ThreadsStats {
    followers: number
    posts: number
    username?: string
}

export async function fetchThreadsStats(accessToken: string, threadsId?: string, username?: string): Promise<ThreadsStats> {
    let followerCount = 0
    let postsCount = 0
    let normalizedUsername = String(username || "").replace(/^@+/, "").trim()

    if (!accessToken) {
        throw new Error("Missing accessToken for Threads stats fetch")
    }

    // 1. Try Threads Insights API for official follower count metric
    if (threadsId) {
        try {
            const insightsUrl = `https://graph.threads.net/v1.0/${threadsId}/threads_insights?metric=followers_count&access_token=${accessToken}`
            const res = await fetch(insightsUrl)
            if (res.ok) {
                const iData = await res.json()
                const first = iData?.data?.[0]
                const val =
                    (typeof first?.total_value === "object" && first?.total_value != null && "value" in first.total_value
                        ? first.total_value.value
                        : first?.total_value) ??
                    first?.values?.[0]?.value ??
                    0
                followerCount = Math.max(followerCount, Number(val) || 0)
            }
        } catch (err) {
            console.warn("Threads Insights API failed:", err)
        }
    }

    // 2. Try redundant fields and multiple API variations
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

            // If we got a positive follower count, we can stop trying basic profile urls
            if (followerCount > 0) break
        } catch (err) {
            console.warn("Threads profile fetch variation failed")
        }
    }

    // 2.5 New Fallback: If postsCount is 0, try to count them manually from /me/threads
    if (postsCount === 0) {
        try {
            const threadsListUrl = `https://graph.threads.net/v1.0/me/threads?fields=id&access_token=${accessToken}`
            const threadsRes = await fetch(threadsListUrl)
            if (threadsRes.ok) {
                const threadsData = await threadsRes.json()
                if (threadsData.data) {
                    postsCount = threadsData.data.length
                    console.log(`Manually counted ${postsCount} threads`)
                }
            }
        } catch (err) {
            console.warn("Threads manual post count failed:", err)
        }
    }

    // 3. Fallback: Profile Lookup (Username-based)
    if (followerCount === 0 && normalizedUsername) {
        try {
            const lookupUrl = `https://graph.threads.net/v1.0/profile_lookup?username=${encodeURIComponent(normalizedUsername)}&fields=follower_count&access_token=${accessToken}`
            const lookupRes = await fetch(lookupUrl)
            if (lookupRes.ok) {
                const lData = await lookupRes.json()
                followerCount = Math.max(followerCount, Number(lData.follower_count ?? 0) || 0)
            }
        } catch (err) {
            console.warn("Threads Profile Lookup failed")
        }
    }

    // 4. Final Fallback: Public profile scrape (Only as last resort)
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
        } catch (err) {
            console.warn("Threads public profile scrape failed")
        }
    }

    return {
        followers: followerCount,
        posts: postsCount,
        username: normalizedUsername
    }
}
