import config from "@/lib/config"

export async function fetchLinkedInStats(accessToken: string, personId: string) {
    try {
        console.log(`Fetching LinkedIn stats for ${personId}...`);

        // Ensure we have the correct URN format
        const urn = personId.startsWith("urn:li:") ? personId : `urn:li:person:${personId}`;
        const isOrganization = urn.includes(":organization:") || urn.includes(":company:");

        // 1. Fetch Follower Count
        let followers = 0;
        try {
            if (isOrganization) {
                // For organizations
                const orgResponse = await fetch(`https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${urn}`, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "X-Restli-Protocol-Version": "2.0.0"
                    }
                });

                if (orgResponse.ok) {
                    const orgData = await orgResponse.json();
                    // Sum up followers from all regions/seniorities if needed, but usually it's in the first element
                    followers = orgData.elements?.[0]?.followerCountsByStaffCountRange?.reduce((acc: number, curr: any) => acc + curr.followerCount, 0) || 0;
                    if (followers === 0 && orgData.elements?.[0]) {
                        // Fallback to a simpler count if available
                        followers = orgData.elements?.[0]?.totalFollowerCount || 0;
                    }
                } else {
                    console.warn("LinkedIn organization stats failed:", await orgResponse.text());
                }
            } else {
                // For persons
                const edgeType = "FirstDegreeConnection";
                const response = await fetch(`https://api.linkedin.com/v2/networkSizes/${urn}?edgeType=${edgeType}`, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "X-Restli-Protocol-Version": "2.0.0"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    followers = data.firstDegreeSize || 0;
                } else {
                    const errorText = await response.text();
                    console.warn(`LinkedIn networkSizes failed for person ${urn}:`, errorText);

                    // Fallback for some profile types: maybe they need "CompanyFollower" even for persons? (Unlikely but for completeness)
                    if (errorText.includes("Member is not a company")) {
                        // Already handled by isOrganization check, but LinkedIn API can be weird
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching LinkedIn followers:", err);
        }

        // 2. Fetch Post Count (Shares/UGC Posts)
        let posts = 0;
        try {
            // We'll use the shares API to count posts. 
            // Owners query usually requires List(urn) format
            const sharesResponse = await fetch(`https://api.linkedin.com/v2/shares?q=owners&owners=List(${encodeURIComponent(urn)})&count=1`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "X-Restli-Protocol-Version": "2.0.0"
                }
            });

            if (sharesResponse.ok) {
                const sharesData = await sharesResponse.json();
                posts = sharesData.paging?.total || 0;
            } else {
                const sharesError = await sharesResponse.text();
                // console.warn("LinkedIn shares count failed:", sharesError);

                // Try UGC Posts API as fallback (authors query requires List format)
                const ugcResponse = await fetch(`https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${encodeURIComponent(urn)})&count=1`, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "X-Restli-Protocol-Version": "2.0.0"
                    }
                });
                if (ugcResponse.ok) {
                    const ugcData = await ugcResponse.json();
                    posts = ugcData.paging?.total || 0;
                } else {
                    // console.warn("LinkedIn ugcPosts count failed:", await ugcResponse.text());
                }
            }
        } catch (err) {
            console.warn("Error fetching LinkedIn posts count:", err);
        }

        console.log(`LinkedIn stats for ${urn}: ${followers} followers, ${posts} posts`);
        return { followers, posts };
    } catch (error) {
        console.error("Error in fetchLinkedInStats:", error);
        return { followers: 0, posts: 0 };
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
