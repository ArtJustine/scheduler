// lib/firebase/config.ts
// Re-exporting from centralized firebase-client to maintain compatibility
// while avoiding duplicate initialization.
import {
  firebaseApp as app,
  firebaseAuth as auth,
  firebaseDb as db,
  firebaseStorage as storage
} from "../firebase-client"

export { app, auth, db, storage }

