import config from "@/lib/config"

export async function fetchLinkedInStats(accessToken: string, personId: string) {
    try {
        // LinkedIn API for follower count (network size)
        // Note: This requires the correct permissions/scopes
        // personId should be the URN like 'urn:li:person:XXXX'
        const isOrganization = personId.includes(":organization:");
        const edgeType = isOrganization ? "CompanyFollower" : "FirstDegreeConnection";

        const response = await fetch(`https://api.linkedin.com/v2/networkSizes/${personId}?edgeType=${edgeType}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0"
            }
        })

        if (!response.ok) {
            console.warn(`LinkedIn networkSizes failed for ${edgeType}:`, await response.text());
            return { followers: 0, posts: 0 }
        }

        const data = await response.json()
        return {
            followers: data.firstDegreeSize || 0,
            posts: 0
        }
    } catch (error) {
        console.error("Error fetching LinkedIn stats:", error)
        return { followers: 0, posts: 0 }
    }
}

export async function refreshLinkedInToken(refreshToken: string) {
    try {
        const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: config.linkedin.clientId,
                client_secret: config.linkedin.clientSecret,
            }),
        })

        if (!response.ok) throw new Error("Failed to refresh LinkedIn token")

        const data = await response.json()
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken, // Refresh token might not always be returned
            expiresIn: data.expires_in
        }
    } catch (error) {
        console.error("LinkedIn refresh token error:", error)
        throw error
    }
}
