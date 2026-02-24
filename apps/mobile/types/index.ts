/**
 * Chiyu Social — Shared type definitions
 * ────────────────────────────────────────────────────────
 * Copied from the web app's types/ folder so we don't
 * import across project boundaries. When you create a
 * monorepo `packages/shared` later, move these there.
 */

// ── Social accounts (web: types/social.ts) ──────────────────────

export type SocialAccountType =
    | 'instagram'
    | 'youtube'
    | 'tiktok'
    | 'threads'
    | 'facebook'
    | 'twitter'
    | 'pinterest'
    | 'linkedin'
    | 'bluesky';

export interface SocialAccount {
    username: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiry?: string;
    connected: boolean;
    connectedAt: string;
    followers?: number;
    followersGrowth?: number;
    engagement?: number;
    impressions?: number;
    posts?: number;
    profileUrl?: string;
    profileImage?: string;
    updatedAt?: string;
}

export interface SocialAccounts {
    instagram?: SocialAccount | null;
    youtube?: SocialAccount | null;
    tiktok?: SocialAccount | null;
    threads?: SocialAccount | null;
    facebook?: SocialAccount | null;
    twitter?: SocialAccount | null;
    pinterest?: SocialAccount | null;
    linkedin?: SocialAccount | null;
    bluesky?: SocialAccount | null;
}

// ── Posts (web: types/post.ts) ──────────────────────────────────

export interface PostType {
    id: string;
    userId: string;
    title: string;
    description: string;
    platform: string;
    platforms?: string[];
    contentType: string;
    scheduledFor: string;
    mediaUrl: string | null;
    thumbnailUrl?: string | null;
    status: 'scheduled' | 'published' | 'failed';
    error?: string | null;
    createdAt: string;
    content?: string;
    publishedAt?: string;
    analytics?: {
        likes: number;
        comments: number;
        shares: number;
        impressions: number;
    };
    aspectRatio?: '9:16' | '16:9' | 'community';
    youtubePostType?: 'video' | 'short' | 'community';
    youtubeOptions?: {
        playlist?: string;
        madeForKids?: boolean;
        ageRestriction?: boolean;
        alteredContent?: boolean;
        tags?: string[];
        category?: string;
    };
}

// ── Workspaces (web: types/workspace.ts) ────────────────────────

export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
    updatedAt: string;
    accounts: SocialAccounts;
}

// ── User ────────────────────────────────────────────────────────

export interface ChiyuUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt?: string;
}
