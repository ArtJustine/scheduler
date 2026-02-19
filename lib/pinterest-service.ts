import config from "@/lib/config"

export async function fetchPinterestStats(accessToken: string) {
    try {
        console.log("Fetching Pinterest stats...");

        const response = await fetch("https://api.pinterest.com/v5/user_account", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Pinterest stats success:", data);
            return {
                followers: data.follower_count || 0,
                posts: data.pin_count || 0
            };
        } else {
            console.warn("Pinterest stats failed:", await response.text());
            return { followers: 0, posts: 0 };
        }
    } catch (error) {
        console.error("Error in fetchPinterestStats:", error);
        return { followers: 0, posts: 0 };
    }
}

export async function refreshPinterestToken(refreshToken: string) {
    try {
        const auth = Buffer.from(`${config.pinterest.appId}:${config.pinterest.appSecret}`).toString("base64");

        const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${auth}`
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        })

        if (!response.ok) throw new Error("Failed to refresh Pinterest token")

        const data = await response.json()
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresIn: data.expires_in
        }
    } catch (error) {
        console.error("Pinterest refresh token error:", error)
        throw error
    }
}
