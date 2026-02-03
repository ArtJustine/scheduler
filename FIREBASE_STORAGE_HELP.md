# Fixing Media Upload Issues (Firebase Storage)

If you are seeing "Network error" or "Upload failed" when trying to upload media, it is likely due to one of two reasons:

1. **CORS Configuration** (Most Likely): Firebase Storage blocks uploads from the browser by default unless Cross-Origin Resource Sharing (CORS) is configured.
2. **Storage Rules**: You might not have permission to write to the storage bucket.

## Step 1: Configure CORS

You need to apply the `cors.json` file (created in this directory) to your Firebase Storage bucket.

### Option A: Using Google Cloud Console (Web UI)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project: `socialmedia-scheduler-eb22f`.
3. Activate Cloud Shell (icon in the top right).
4. Upload the `cors.json` file to the Cloud Shell using the logic in the "three dots" menu of the terminal.
5. Run this command in the Cloud Shell:
   ```bash
   gsutil cors set cors.json gs://socialmedia-scheduler-eb22f.firebasestorage.app
   ```
   *(Note: Verify your bucket name in the Firebase Console -> Storage if the above command fails)*

### Option B: Using Local Terminal (Requires gsutil)
If you have `gcloud` or `gsutil` installed locally:
```bash
gsutil cors set cors.json gs://socialmedia-scheduler-eb22f.firebasestorage.app
```

## Step 2: Check Storage Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Storage** -> **Rules**.
3. Ensure your rules allow authenticated users to write. Example rules for development:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 3: Verify Initialization

If you see "Storage not initialized", verify your `lib/config.ts` has the correct `storageBucket`.
Current setting: `socialmedia-scheduler-eb22f.firebasestorage.app`
