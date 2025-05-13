export type SocialAccountType = "instagram" | "youtube" | "tiktok"

export interface SocialAccount {
  username: string
  accessToken: string
  refreshToken?: string
  tokenExpiry?: string
  connected: boolean
  connectedAt: string
  followers?: number
  followersGrowth?: number
  engagement?: number
  impressions?: number
  posts?: number
  profileUrl?: string
  updatedAt?: string
}

export interface SocialAccounts {
  instagram?: SocialAccount | null
  youtube?: SocialAccount | null
  tiktok?: SocialAccount | null
}
