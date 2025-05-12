export type SocialAccountType = "instagram" | "youtube" | "tiktok"

export interface SocialAccount {
  id?: string
  username: string
  accessToken: string
  profileUrl?: string
  connected: boolean
  connectedAt: string
  followers?: number
  followersGrowth?: number
  engagement?: number
  impression?: number
  posts?: number
}

export interface SocialAccounts {
  instagram?: SocialAccount
  youtube?: SocialAccount
  tiktok?: SocialAccount
}
