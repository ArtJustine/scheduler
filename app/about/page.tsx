"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1 pt-24 pb-20">
                <section>
                    <div className="container px-6 max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                            About <span className="text-primary">Chiyu Social</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-12 font-medium italic">Built for Creators, by a Creator</p>

                        <div className="prose prose-lg dark:prose-invert mx-auto text-center">
                            <p className="mb-8 leading-relaxed">
                                Chiyu Social wasn’t born in a corporate boardroom. It was built at a desk cluttered with smart home gear, code editors, and the daily hustle of managing multiple clients.
                            </p>

                            <p className="mb-12 leading-relaxed">
                                As a web developer and UI/UX designer with over a decade of experience in storytelling, I’ve seen how the "big" scheduling tools often feel like cold, bloated spreadsheets. They get the job done, but they lack the soul of the creative process. I built Chiyu to change that.
                            </p>

                            <h2 className="text-3xl font-bold mt-16 mb-6">Our Mission: Clarity and Control</h2>
                            <p className="mb-8">
                                The name "Chiyu" represents a sense of healing and balance. For a creator, nothing is more stressful than a disorganized feed or a clunky workflow. Our mission is to provide:
                            </p>

                            <div className="grid gap-8 text-center mb-16">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Human-Centric Design</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">A UI that feels like an extension of your creative brain, not a hurdle to jump over.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Smart Efficiency</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">Using the best of modern API technology to ensure your content hits the right audience at the right time.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Transparency</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">No "black box" algorithms. You own your data, you control your schedule, and you have a direct line to the person who built the tool.</p>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold mt-16 mb-6">A Family-First Project</h2>
                            <p className="mb-8 leading-relaxed">
                                Chiyu is more than just a software startup; it’s a project driven by a commitment to quality and a desire to provide for my family of four. When you use Chiyu, you aren't just a number in a database; you’re supporting a fellow creator who believes that great tools should be built with care, integrity, and a touch of wit.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
