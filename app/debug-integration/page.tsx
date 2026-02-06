"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"
import { firebaseStorage } from "@/lib/firebase-client"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function DebugPage() {
    const { user } = useAuth()
    const [logs, setLogs] = useState<string[]>([])
    const [uploadResult, setUploadResult] = useState<string>("")
    const [isSchedulerRunning, setIsSchedulerRunning] = useState(false)

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    }

    const testTikTokConnection = async () => {
        addLog("Starting TikTok connection test...")

        if (!user) {
            addLog("❌ ERROR: No user authenticated")
            return
        }

        addLog(`✓ User authenticated: ${user.uid}`)

        try {
            const url = `/api/auth/tiktok?userId=${user.uid}`
            addLog(`Redirecting to: ${url}`)
            window.location.href = url
        } catch (error: any) {
            addLog(`❌ ERROR: ${error.message}`)
        }
    }

    const testFirebaseStorage = async () => {
        addLog("Testing Firebase Storage...")
        setUploadResult("")

        if (!user) {
            addLog("❌ ERROR: No user authenticated")
            return
        }

        addLog(`✓ User authenticated: ${user.uid}`)

        if (!firebaseStorage) {
            addLog("❌ ERROR: Firebase Storage not initialized")
            return
        }

        addLog("✓ Firebase Storage initialized")

        try {
            // Create a test file
            const testData = new Blob(["Hello, Firebase Storage!"], { type: "text/plain" })
            const timestamp = Date.now()
            const storageRef = ref(firebaseStorage, `test/${user.uid}/test_${timestamp}.txt`)

            addLog(`Uploading to: ${storageRef.fullPath}`)

            const snapshot = await uploadBytes(storageRef, testData)
            addLog(`✓ Upload successful: ${snapshot.metadata.fullPath}`)

            const downloadURL = await getDownloadURL(storageRef)
            addLog(`✓ Download URL obtained: ${downloadURL}`)
            setUploadResult(downloadURL)

        } catch (error: any) {
            addLog(`❌ UPLOAD ERROR: ${error.code || error.message}`)
            if (error.code === 'storage/unauthorized') {
                addLog("⚠️  This is a PERMISSIONS error. Check Firebase Storage Rules.")
            } else if (error.code === 'storage/unknown') {
                addLog("⚠️  This is likely a CORS error. Run the CORS configuration command.")
            }
        }
    }

    const checkFirestoreConnection = async () => {
        addLog("Checking Firestore connection...")

        if (!user) {
            addLog("❌ ERROR: No user authenticated")
            return
        }

        try {
            const { getSocialAccounts } = await import("@/lib/firebase/social-accounts")
            const accounts = await getSocialAccounts()

            addLog(`✓ Firestore connection successful`)
            addLog(`Connected platforms: ${Object.keys(accounts).filter(k => (accounts as any)[k]).join(", ") || "None"}`)

            if ((accounts as any).tiktok) {
                addLog(`✓ TikTok account found: ${(accounts as any).tiktok.username}`)
            } else {
                addLog(`⚠️  No TikTok account in Firestore`)
            }

        } catch (error: any) {
            addLog(`❌ FIRESTORE ERROR: ${error.message}`)
        }
    }

    const runScheduler = async () => {
        addLog("Manual scheduler trigger started...")
        setIsSchedulerRunning(true)
        try {
            const response = await fetch("/api/cron/scheduler?secret=development")
            const data = await response.json()
            if (response.ok) {
                addLog(`✓ Scheduler finished: ${data.message}`)
            } else {
                addLog(`❌ Scheduler error: ${data.error}`)
            }
        } catch (error: any) {
            addLog(`❌ Network error: ${error.message}`)
        } finally {
            setIsSchedulerRunning(false)
        }
    }

    const checkCookies = () => {
        addLog("Checking cookies...")
        const cookies = document.cookie.split(';')

        if (cookies.length === 0 || (cookies.length === 1 && cookies[0] === '')) {
            addLog("⚠️  No cookies found")
        } else {
            cookies.forEach(cookie => {
                const [name] = cookie.trim().split('=')
                if (name.includes('oauth') || name.includes('social')) {
                    addLog(`Cookie: ${name}`)
                }
            })
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>🔍 Debug Dashboard</CardTitle>
                    <CardDescription>
                        Diagnose TikTok integration and media upload issues
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={testTikTokConnection} variant="outline">
                            Test TikTok Connection
                        </Button>
                        <Button onClick={testFirebaseStorage} variant="outline">
                            Test Storage Upload
                        </Button>
                        <Button onClick={checkFirestoreConnection} variant="outline">
                            Check Firestore
                        </Button>
                        <Button onClick={checkCookies} variant="outline">
                            Check Cookies
                        </Button>
                        <Button onClick={runScheduler} variant="default" disabled={isSchedulerRunning} className="bg-primary text-white">
                            {isSchedulerRunning ? "Running..." : "Trigger Scheduler"}
                        </Button>
                    </div>

                    {uploadResult && (
                        <Alert>
                            <AlertDescription>
                                ✓ Upload successful! <a href={uploadResult} target="_blank" rel="noopener noreferrer" className="underline">View file</a>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Debug Logs:</h3>
                        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs h-[400px] overflow-y-auto">
                            {logs.length === 0 ? (
                                <div className="text-gray-500">Click a button above to start testing...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))
                            )}
                        </div>
                    </div>

                    <Alert>
                        <AlertDescription className="text-xs">
                            <strong>Quick Fixes:</strong><br />
                            1. For TikTok: Check browser console for OAuth errors<br />
                            2. For Storage: Run <code className="bg-muted px-1 rounded">gsutil cors set cors.json gs://socialmedia-scheduler-eb22f.firebasestorage.app</code><br />
                            3. Check Firebase Console → Storage → Rules (should allow authenticated users)
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
}
