"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1">
                <section className="py-20 md:py-32 pt-32 relative overflow-hidden bg-background">
                    <div className="container px-6">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-8">
                                About <span className="text-primary">Chiyu</span>
                            </h1>
                            <div className="prose prose-lg dark:prose-invert">
                                <p>
                                    Chiyu was born from a simple idea: social media management shouldn't be a full-time job.
                                    We believe that creators should spend their time creating, not wrestling with scheduling tools and spreadsheets.
                                </p>
                                <p>
                                    Our mission is to provide the most intuitive, powerful, and beautiful scheduling experience on the web.
                                    We combine advanced automation with a premium, user-first design to help you grow your audience effortlessly.
                                </p>
                                <h3>Our Values</h3>
                                <ul>
                                    <li><strong>Simplicity:</strong> We believe less is more.</li>
                                    <li><strong>Design:</strong> Tools should be beautiful and inspiring to use.</li>
                                    <li><strong>Creator First:</strong> We build for the people who create the content.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
