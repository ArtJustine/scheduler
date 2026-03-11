
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Attempt to load environment variables from .env.local
try {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    envLocal.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) {
    console.log('No .env.local found, using process.env');
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;

if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey,
        }),
    });
} else {
    admin.initializeApp({
        projectId: projectId || 'socialmedia-scheduler-eb22f',
    });
}

const db = admin.firestore();

async function checkRecentPosts() {
    console.log('--- Checking Last 5 Posts ---');
    const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').limit(5).get();

    if (snapshot.empty) {
        console.log('No posts found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\nPost ID: ${doc.id}`);
        console.log(`Status: ${data.status}`);
        console.log(`Platforms: ${data.platforms.join(', ')}`);

        if (data.platformResults) {
            console.log('Platform Results:');
            Object.entries(data.platformResults).forEach(([platform, result]) => {
                console.log(`  - ${platform}: ${result.status} ${result.error ? 'ERROR: ' + result.error : ''}`);
                if (result.errorDetails) {
                    console.log(`    Details: ${JSON.stringify(result.errorDetails)}`);
                }
            });
        }

        if (data.error) {
            console.log(`Global Error: ${data.error}`);
        }
    });
}

checkRecentPosts().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
