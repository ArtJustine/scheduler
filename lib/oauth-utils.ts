// lib/oauth-utils.ts
// Utility functions for OAuth authentication across social media platforms

import { config } from "./config"
import * as crypto from "node:crypto"

export interface OAuthToken {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
  user_id?: string
  platform: string
  created_at: number
}

export interface OAuthError {
  error: string
  error_description?: string
  error_reason?: string
}

// Instagram OAuth utilities
export const instagramOAuth = {
  getAuthUrl: (state: string = "instagram_auth", redirectUri?: string) => {
    const url = new URL("https://api.instagram.com/oauth/authorize")
    url.searchParams.set("client_id", config.instagram.appId)
    url.searchParams.set("redirect_uri", redirectUri || config.instagram.redirectUri)
    url.searchParams.set("scope", "user_profile,user_media")
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", state)
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, redirectUri?: string): Promise<OAuthToken> => {
    const response = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.instagram.appId,
        client_secret: config.instagram.appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || config.instagram.redirectUri,
        code: code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram token exchange failed: ${error.error_message || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      user_id: data.user_id,
      platform: "instagram",
      created_at: Date.now(),
    }
  },
}

// YouTube OAuth utilities
export const youtubeOAuth = {
  getAuthUrl: (state: string = "youtube_auth", redirectUri?: string) => {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    url.searchParams.set("client_id", config.youtube.clientId)
    url.searchParams.set("redirect_uri", redirectUri || config.youtube.redirectUri)
    url.searchParams.set("scope", config.youtube.scopes.join(" "))
    url.searchParams.set("response_type", "code")
    url.searchParams.set("access_type", "offline")
    url.searchParams.set("prompt", "consent")
    url.searchParams.set("state", state)
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, redirectUri?: string): Promise<OAuthToken> => {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.youtube.clientId,
        client_secret: config.youtube.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || config.youtube.redirectUri,
        code: code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`YouTube token exchange failed: ${error.error_description || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
      platform: "youtube",
      created_at: Date.now(),
    }
  },
}

// TikTok OAuth utilities
export const tiktokOAuth = {
  getAuthUrl: (state: string = "tiktok_auth", redirectUri?: string, codeVerifier?: string): string => {
    // TikTok Login Kit for Web does NOT use PKCE
    // Only Desktop apps require PKCE
    const url = new URL("https://www.tiktok.com/v2/auth/authorize/")
    url.searchParams.set("client_key", config.tiktok.clientKey)
    url.searchParams.set("redirect_uri", redirectUri || config.tiktok.redirectUri)
    // Only request user.info.basic for Sandbox - other scopes need approval
    url.searchParams.set("scope", "user.info.basic")
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", state)
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, codeVerifier?: string, redirectUri?: string): Promise<OAuthToken> => {
    const params: Record<string, string> = {
      client_key: config.tiktok.clientKey,
      client_secret: config.tiktok.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri || config.tiktok.redirectUri,
      code: code,
    }

    // Only add code_verifier if provided (for Desktop apps that use PKCE)
    if (codeVerifier) {
      params.code_verifier = codeVerifier
    }

    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: new URLSearchParams(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`TikTok token exchange failed: ${error.error_description || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
      platform: "tiktok",
      created_at: Date.now(),
    }
  },
}

// Facebook OAuth utilities (for Instagram Business)
export const facebookOAuth = {
  getAuthUrl: (state: string = "facebook_auth", redirectUri?: string) => {
    const url = new URL(`https://www.facebook.com/v${config.facebook.apiVersion}/dialog/oauth`)
    url.searchParams.set("client_id", config.facebook.appId)
    url.searchParams.set("redirect_uri", redirectUri || config.facebook.redirectUri)
    url.searchParams.set("scope", config.facebook.scopes.join(","))
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", state)
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, redirectUri?: string): Promise<OAuthToken> => {
    const url = new URL(`https://graph.facebook.com/v${config.facebook.apiVersion}/oauth/access_token`)
    url.searchParams.set("client_id", config.facebook.appId)
    url.searchParams.set("client_secret", config.facebook.appSecret)
    url.searchParams.set("redirect_uri", redirectUri || config.facebook.redirectUri)
    url.searchParams.set("code", code)

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Facebook token exchange failed: ${error.error?.message || error.error_description || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      platform: "facebook",
      created_at: Date.now(),
    }
  },
}

// Twitter OAuth utilities
export const twitterOAuth = {
  getAuthUrl: (state: string = "twitter_auth") => {
    const url = new URL("https://twitter.com/i/oauth2/authorize")
    url.searchParams.set("client_id", config.twitter.clientId)
    url.searchParams.set("redirect_uri", config.twitter.redirectUri)
    url.searchParams.set("scope", config.twitter.scopes.join(" "))
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", state)
    url.searchParams.set("code_challenge_method", "S256")
    // Note: You'll need to implement PKCE (Proof Key for Code Exchange) for Twitter
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, codeVerifier: string): Promise<OAuthToken> => {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${config.twitter.clientId}:${config.twitter.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: config.twitter.redirectUri,
        code: code,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Twitter token exchange failed: ${error.error_description || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
      platform: "twitter",
      created_at: Date.now(),
    }
  },
}

// LinkedIn OAuth utilities
export const linkedinOAuth = {
  getAuthUrl: (state: string = "linkedin_auth", redirectUri?: string) => {
    const url = new URL("https://www.linkedin.com/oauth/v2/authorization")
    url.searchParams.set("client_id", config.linkedin.clientId)
    url.searchParams.set("redirect_uri", redirectUri || config.linkedin.redirectUri)
    url.searchParams.set("scope", config.linkedin.scopes.join(" "))
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", state)
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, redirectUri?: string): Promise<OAuthToken> => {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.linkedin.clientId,
        client_secret: config.linkedin.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || config.linkedin.redirectUri,
        code: code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`LinkedIn token exchange failed: ${error.error_description || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
      platform: "linkedin",
      created_at: Date.now(),
    }
  },
}

// Pinterest OAuth utilities
export const pinterestOAuth = {
  getAuthUrl: (state: string = "pinterest_auth", redirectUri?: string) => {
    const url = new URL("https://www.pinterest.com/oauth/")
    url.searchParams.set("client_id", config.pinterest.appId)
    url.searchParams.set("redirect_uri", redirectUri || config.pinterest.redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", config.pinterest.scopes.join(","))
    url.searchParams.set("state", state)
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, redirectUri?: string): Promise<OAuthToken> => {
    const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${config.pinterest.appId}:${config.pinterest.appSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: redirectUri || config.pinterest.redirectUri,
        code: code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Pinterest token exchange failed: ${error.error_description || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
      platform: "pinterest",
      created_at: Date.now(),
    }
  },
}

// Threads OAuth utilities
export const threadsOAuth = {
  getAuthUrl: (state: string = "threads_auth", redirectUri?: string) => {
    const url = new URL("https://www.threads.net/oauth/authorize")
    url.searchParams.set("client_id", config.threads.appId)
    url.searchParams.set("redirect_uri", redirectUri || config.threads.redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", config.threads.scopes.join(","))
    url.searchParams.set("state", state)
    return url.toString()
  },

  exchangeCodeForToken: async (code: string, redirectUri?: string): Promise<OAuthToken> => {
    const response = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.threads.appId,
        client_secret: config.threads.appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || config.threads.redirectUri,
        code: code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Threads token exchange failed: ${error.error_description || error.error}`)
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      user_id: data.user_id,
      platform: "threads",
      created_at: Date.now(),
    }
  },
}

// Generic OAuth helper functions
export const oauthHelpers = {
  generateState: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  },

  validateState: (receivedState: string, expectedState: string): boolean => {
    return receivedState === expectedState
  },

  generateCodeVerifier: (): string => {
    const array = new Uint8Array(32)
    // Use Node.js crypto.webcrypto for getRandomValues
    crypto.webcrypto.getRandomValues(array)
    return Buffer.from(array).toString("base64url")
  },

  generateCodeChallenge: (codeVerifier: string): string => {
    // This is required for TikTok's S256 code_challenge_method
    const hash = crypto.createHash("sha256").update(codeVerifier).digest()
    return hash.toString("base64url")
  },

  isTokenExpired: (token: OAuthToken): boolean => {
    if (!token.expires_in) return false
    const expirationTime = token.created_at + (token.expires_in * 1000)
    return Date.now() >= expirationTime
  },

  shouldRefreshToken: (token: OAuthToken): boolean => {
    if (!token.expires_in || !token.refresh_token) return false
    const expirationTime = token.created_at + (token.expires_in * 1000)
    const refreshThreshold = 5 * 60 * 1000 // 5 minutes before expiration
    return Date.now() >= (expirationTime - refreshThreshold)
  },
} 