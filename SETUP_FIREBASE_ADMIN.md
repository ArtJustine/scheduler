# Setting Up Firebase Admin SDK

To fix the "Missing or insufficient permissions" error, we have switched the server-side operations (publishing posts) to use the **Firebase Admin SDK**.

This requires two new environment variables in Vercel.

## 1. Get Your Service Account Key

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: **socialmedia-scheduler-eb22f**.
3.  Click the **Gear icon** next to "Project Overview" and select **Project settings**.
4.  Go to the **Service accounts** tab.
5.  Click **Generate new private key**.
6.  This will download a JSON file. Open it with a text editor.

## 2. Add Variables to Vercel

Go to your Vercel project settings -> **Environment Variables** and add these two:

### Variable 1: `FIREBASE_CLIENT_EMAIL`
*   **Value:** Copy the `client_email` value from the JSON file.
    *   Example: `firebase-adminsdk-xxxxx@socialmedia-scheduler-eb22f.iam.gserviceaccount.com`

### Variable 2: `FIREBASE_PRIVATE_KEY`
*   **Value:** Copy the `private_key` value from the JSON file.
    *   **Imortant:** It looks like `-----BEGIN PRIVATE KEY-----\n...`. Copy the entire string including the `-----BEGIN...` and `-----END...` parts.

## 3. Redeploy

After adding these variables, go to your **Deployments** tab in Vercel and **Redeploy** the latest commit for the changes to take effect.
