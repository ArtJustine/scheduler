import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1 pt-24 pb-20">
                <section>
                    <div className="container px-6 max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold font-heading mb-8">Privacy Policy</h1>
                        <div className="prose prose-lg dark:prose-invert">
                            <p>At Chiyu, we take your privacy seriously. This policy explains how we collect and use your data.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, such as your name, email, and social media credentials.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">2. How We Use Information</h3>
                            <p>We use your information to provide, maintain, and improve our services.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">3. Data Security</h3>
                            <p>We implement appropriate security measures to protect your personal information.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">4. Third-Party Services</h3>
                            <p>We may share data with third-party service providers (e.g., social media platforms) as required to deliver our service.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">5. Contact Us</h3>
                            <p>If you have any questions about this policy, please contact us.</p>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
