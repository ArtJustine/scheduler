import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1 pt-24 pb-20">
                <section>
                    <div className="container px-6 max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl font-bold font-heading mb-4">Terms of Service for Chiyu Social</h1>
                        <p className="text-muted-foreground mb-12 italic">Effective Date: February 22, 2026</p>

                        <div className="prose prose-lg dark:prose-invert mx-auto text-center">
                            <h2 className="text-2xl font-bold mt-10 mb-4">1. Acceptance of Terms</h2>
                            <p className="mb-8">By creating an account on Chiyu Social, you agree to these terms. If you're using Chiyu on behalf of a business or client, you represent that you have the authority to bind them to these terms.</p>

                            <h2 className="text-2xl font-bold mt-10 mb-4">2. Service Description</h2>
                            <p className="mb-8">Chiyu Social is a scheduling tool that allows you to connect your social media accounts via official APIs to plan and publish content. We provide the "pipes," but you are responsible for the content you send through them.</p>

                            <h2 className="text-2xl font-bold mt-10 mb-4">3. Account Responsibilities</h2>
                            <div className="space-y-4 mb-8">
                                <p><strong>Security:</strong> You are responsible for keeping your login credentials safe.</p>
                                <p><strong>API Compliance:</strong> You agree to follow the specific terms of the platforms you connect (e.g., YouTube's Terms of Service, Meta's Developer Policies).</p>
                                <p><strong>Prohibited Content:</strong> Do not use Chiyu to distribute spam, malware, or content that violates the laws of your jurisdiction.</p>
                            </div>

                            <h2 className="text-2xl font-bold mt-10 mb-4">4. Fees and Payments</h2>
                            <p className="mb-8">If you're on a paid plan, you agree to pay the fees associated with that tier. We’ll notify you before any price changes. You can cancel at any time, but we generally do not offer refunds for partial months of service.</p>

                            <h2 className="text-2xl font-bold mt-10 mb-4">5. Limitation of Liability</h2>
                            <p className="mb-8">We strive for 100% uptime, but Chiyu is provided "as is." We aren't liable for any lost profits or data if a social platform changes its API or if our service experiences an outage.</p>

                            <h2 className="text-2xl font-bold mt-10 mb-4">6. Termination</h2>
                            <p className="mb-8">We reserve the right to suspend accounts that violate these terms or the terms of the social platforms we integrate with.</p>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
