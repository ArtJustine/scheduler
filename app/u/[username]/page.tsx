"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2, ExternalLink, Share2, Globe, Heart } from "lucide-react"

interface BioLink {
    id: string
    title: string
    url: string
    enabled: boolean
}

interface BioProfile {
    displayName: string
    bio: string
    profileImage?: string
    theme?: string
    links: BioLink[]
}

export default function PublicBioPage() {
    const params = useParams()
    const username = params.username as string
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<BioProfile | null>(null)

    useEffect(() => {
        // In a real app, this would fetch from Firestore based on the username
        const fetchProfile = async () => {
            try {
                setIsLoading(true)
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 800))

                // Mock data
                setProfile({
                    displayName: username.charAt(0).toUpperCase() + username.slice(1),
                    bio: "Digital creator and social media strategist. Building the future of distribution.",
                    theme: "glass",
                    links: [
                        { id: "1", title: "Join my Newsletter", url: "#", enabled: true },
                        { id: "2", title: "Latest YouTube Video", url: "#", enabled: true },
                        { id: "3", title: "Scale Your Distribution", url: "#", enabled: true },
                        { id: "4", title: "Work with Me", url: "#", enabled: true }
                    ]
                })
            } catch (err) {
                console.error("Error fetching bio profile:", err)
            } finally {
                setIsLoading(false)
            }
        }

        if (username) {
            fetchProfile()
        }
    }, [username])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-8">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-zinc-500 mb-8">This digital space hasn't been claimed yet.</p>
                <a href="/" className="rounded-full bg-primary text-primary-foreground px-8 py-3 h-auto font-bold transition-all hover:scale-105 active:scale-95 border-0 shadow-lg shadow-primary/25">Start yours at Chiyu</a>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            {/* Dynamic Background Effects - Minimal */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[140px] opacity-40" />
            </div>

            <main className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="h-24 w-24 rounded-full bg-primary p-[2px] mb-6 shadow-2xl">
                        <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            <span className="text-3xl font-bold">{profile.displayName.charAt(0)}</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 tracking-tight">@{username}</h1>
                    <p className="text-zinc-500 text-center max-w-sm leading-relaxed">{profile.bio}</p>
                </div>

                {/* Social Bar - Simplified for now */}
                <div className="flex gap-6 mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100 opacity-60">
                    <Share2 className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                    <Globe className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                    <Heart className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                </div>

                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                    {profile.links.filter(l => l.enabled).map((link, index) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block w-full p-4 bg-[#111] hover:bg-zinc-900 border border-zinc-800 hover:border-primary rounded-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <span className="font-semibold text-lg">{link.title}</span>
                                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    ))}
                </div>

                {/* Footer Branding */}
                <footer className="mt-24 flex flex-col items-center animate-in fade-in duration-1000 delay-500 opacity-40 hover:opacity-100 transition-opacity">
                    <a href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em]">
                        Created with <span className="text-primary tracking-normal font-black italic">CHIYU</span>
                    </a>
                </footer>
            </main>
        </div>
    )
}
