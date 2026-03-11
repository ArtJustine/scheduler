import { adminDb } from '../lib/firebase-admin';

async function main() {
  if (!adminDb) {
    console.error("No database connection");
    return;
  }
  const snapshot = await adminDb.collection("posts").orderBy("createdAt", "desc").limit(5).get();
  snapshot.docs.forEach(doc => {
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
