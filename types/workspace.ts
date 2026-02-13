export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
    updatedAt: string;
    accounts: {
        instagram?: any;
        youtube?: any;
        tiktok?: any;
        threads?: any;
        facebook?: any;
        twitter?: any;
        pinterest?: any;
        linkedin?: any;
    };
}
