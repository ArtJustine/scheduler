
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let adminDb = null;
try {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '';
    const credential = cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: serviceAccountKey,
    });
    initializeApp({ credential });
  }
  adminDb = getFirestore();
} catch (error) {
  console.error('Firebase admin error:', error);
}

async function main() {
  const posts = await adminDb.collection("posts").orderBy("createdAt", "desc").limit(5).get();
  posts.docs.forEach(doc => {
    const data = doc.data();
    console.log(JSON.stringify({
      id: doc.id,
      title: data.title,
      status: data.status,
      scheduledFor: data.scheduledFor,
      createdAt: data.createdAt,
      error: data.error,
      platformResults: data.platformResults,
    }, null, 2));
  });
}

main().catch(console.error);
