import { BskyAgent } from "@atproto/api"

export interface BlueskyStats {
    followers: number
    posts: number
    username?: string
}

export async function loginBluesky(identifier: string, appPassword: string) {
    const agent = new BskyAgent({
        service: "https://bsky.social",
    })

    try {
        await agent.login({
            identifier,
            password: appPassword,
        })

        const profile = await agent.getProfile({ actor: identifier })

        return {
            success: true,
            did: profile.data.did,
            handle: profile.data.handle,
            displayName: profile.data.displayName,
            avatar: profile.data.avatar,
            followersCount: profile.data.followersCount || 0,
            postsCount: profile.data.postsCount || 0,
            session: agent.session,
        }
    } catch (error: any) {
        console.error("Bluesky login error:", error)
        return {
            success: false,
            error: error.message || "Failed to login to Bluesky",
        }
    }
}

export async function fetchBlueskyStats(identifier: string, appPassword: string): Promise<BlueskyStats> {
    const agent = new BskyAgent({
        service: "https://bsky.social",
    })

    try {
        await agent.login({
            identifier,
            password: appPassword,
        })

        const profile = await agent.getProfile({ actor: identifier })

        return {
            followers: profile.data.followersCount || 0,
            posts: profile.data.postsCount || 0,
            username: profile.data.handle,
        }
    } catch (error) {
        console.error("Error fetching Bluesky stats:", error)
        return { followers: 0, posts: 0 }
    }
}

export async function postToBluesky(identifier: string, appPassword: string, text: string) {
    const agent = new BskyAgent({
        service: "https://bsky.social",
    })

    try {
        await agent.login({
            identifier,
            password: appPassword,
        })

        await agent.post({
            text: text,
            createdAt: new Date().toISOString(),
        })

        return { success: true }
    } catch (error: any) {
        console.error("Bluesky post error:", error)
        return {
            success: false,
            error: error.message || "Failed to post to Bluesky",
        }
    }
}
