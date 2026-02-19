import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1 pt-24 pb-20">
                <section>
                    <div className="container px-6 max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold font-heading mb-8">Terms of Service</h1>
                        <div className="prose prose-lg dark:prose-invert">
                            <p>Welcome to Chiyu. By using our website and services, you agree to these Terms of Service.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">1. Acceptance of Terms</h3>
                            <p>By accessing or using our service, you agree to be bound by these terms.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">2. Use of Service</h3>
                            <p>You agree to use Chiyu only for lawful purposes and in accordance with these Terms.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">3. User Accounts</h3>
                            <p>You are responsible for maintaining the confidentiality of your account credentials.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">4. Content</h3>
                            <p>You retain all rights to the content you post using Chiyu.</p>

                            <h3 className="text-xl font-bold mt-8 mb-4">5. Termination</h3>
                            <p>We reserve the right to terminate or suspend your account at our sole discretion.</p>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
