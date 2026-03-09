import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Try to find .env.local in common locations
const envPath = path.resolve(process.cwd(), '../../.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    // Fallback to current directory for production/CI
    dotenv.config();
}

export default {
    "expo": {
        "name": "Chiyu Social",
        "slug": "chiyu-social",
        "version": "1.0.0",
        "orientation": "portrait",
        "platforms": ["ios", "android"],
        "icon": "./assets/images/icon.png",
        "scheme": "chiyu",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": true,
        "splash": {
            "image": "./assets/images/splash-icon.png",
            "resizeMode": "contain",
            "backgroundColor": "#0A0A0A"
        },
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": "com.chiyu.social"
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/images/adaptive-icon.png",
                "backgroundColor": "#0A0A0A"
            },
            "edgeToEdgeEnabled": true,
            "predictiveBackGestureEnabled": false,
            "package": "com.chiyu.social"
        },
        "plugins": [
            "expo-router",
            "expo-secure-store"
        ],
        "experiments": {
            "typedRoutes": true
        },
        "extra": {
            "firebaseApiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            "firebaseAuthDomain": process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            "firebaseProjectId": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            "firebaseStorageBucket": process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            "firebaseMessagingSenderId": process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            "firebaseAppId": process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            "router": {},
            "eas": {
                "projectId": "de63071c-4aee-4335-8b3a-8c4b5de5d547"
            }
        },
        "owner": "artjustine",
        "runtimeVersion": {
            "policy": "sdkVersion"
        },
        "updates": {
            "url": "https://u.expo.dev/de63071c-4aee-4335-8b3a-8c4b5de5d547"
        }
    }
};
