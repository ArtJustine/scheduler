import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1 pt-24 pb-20">
                <section>
                    <div className="container px-6 max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl font-bold font-heading mb-4">Privacy Policy for Chiyu Social</h1>
                        <p className="text-muted-foreground mb-12 italic">Effective Date: February 22, 2026</p>

                        <div className="prose prose-lg dark:prose-invert mx-auto text-center">
                            <h2 className="text-2xl font-bold mt-10 mb-4">1. Data We Collect</h2>
                            <p className="mb-4">To make Chiyu work, we collect:</p>
                            <div className="space-y-4 mb-8">
                                <p><strong>Account Info:</strong> Your name and email address.</p>
                                <p><strong>Authentication Data:</strong> Secure "tokens" provided by social platforms (like Google or Meta) when you link your accounts. We never see or store your social media passwords.</p>
                                <p><strong>Content:</strong> The posts, images, and videos you upload to our dashboard for scheduling.</p>
                            </div>

                            <h2 className="text-2xl font-bold mt-10 mb-4">2. How We Use Your Data</h2>
                            <p className="mb-4">We use your data strictly to:</p>
                            <div className="space-y-2 mb-8">
                                <p>• Authenticate your identity.</p>
                                <p>• Schedule and publish your content to your chosen platforms.</p>
                                <p>• Improve the UI/UX of Chiyu based on how you use the tool.</p>
                            </div>

                            <h2 className="text-2xl font-bold mt-10 mb-4">3. Data Sharing and Third Parties</h2>
                            <p className="mb-4">We do not sell your data to advertisers. We only share data with:</p>
                            <div className="space-y-4 mb-8">
                                <p><strong>Social Media Platforms:</strong> Only the data you explicitly choose to post.</p>
                                <p><strong>Service Providers:</strong> Secure partners like Stripe (for payments) or database providers (to host your scheduled posts).</p>
                            </div>

                            <h2 className="text-2xl font-bold mt-10 mb-4">4. Data Retention and Deletion</h2>
                            <p className="mb-8">You own your data. If you delete your Chiyu account, we will purge your linked API tokens and scheduled content from our active databases within 30 days.</p>

                            <h2 className="text-2xl font-bold mt-10 mb-4">5. Security</h2>
                            <p className="mb-8">As a developer-led platform, we prioritize security. We use industry-standard encryption to protect your API tokens and personal information.</p>

                            <h2 className="text-2xl font-bold mt-10 mb-4">6. Contact Us</h2>
                            <p className="mb-8">If you have questions about your data, reach out to us at <a href="https://chiyusocial.com/help" className="text-primary hover:underline">chiyusocial.com/help</a>.</p>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
