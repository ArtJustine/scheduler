export interface WorkspaceSettings {
    niche?: string;
    trendCompetitors?: string[];
    notifications?: {
        email?: boolean;
        postReminders?: boolean;
        analyticsUpdates?: boolean;
    };
}

export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
    updatedAt: string;
    settings?: WorkspaceSettings;
    accounts: {
        instagram?: any;
        youtube?: any;
        tiktok?: any;
        threads?: any;
        facebook?: any;
        twitter?: any;
        pinterest?: any;
        linkedin?: any;
        bluesky?: any;
    };
}
