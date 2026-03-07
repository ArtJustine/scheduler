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

export async function postToBluesky(identifier: string, appPassword: string, text: string, mediaUrl?: string) {
    const agent = new BskyAgent({
        service: "https://bsky.social",
    })

    try {
        await agent.login({
            identifier,
            password: appPassword,
        })

        let embed: any = undefined;

        if (mediaUrl) {
            const mediaRes = await fetch(mediaUrl);
            if (!mediaRes.ok) throw new Error("Failed to fetch media from storage for Bluesky upload");
            
            const mediaBlob = await mediaRes.blob();
            const arrayBuffer = await mediaBlob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            const contentType = mediaRes.headers.get("Content-Type") || "image/jpeg";
            
            // Upload the blob
            const uploadedBlob = await agent.uploadBlob(buffer, {
                encoding: contentType,
            });

            const isVideo = contentType.includes("video") || mediaUrl.match(/\.(mp4|mov|webm)$/i);
            
            if (isVideo) {
               embed = {
                   $type: 'app.bsky.embed.video',
                   video: uploadedBlob.data.blob,
               }
            } else {
               embed = {
                   $type: 'app.bsky.embed.images',
                   images: [
                       {
                           alt: text.substring(0, 100),
                           image: uploadedBlob.data.blob,
                       }
                   ]
               }
            }
        }

        await agent.post({
            text: text,
            createdAt: new Date().toISOString(),
            embed: embed
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
