import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpCircle, BookOpen, FileText, Video, MessageSquare } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground">Learn how to use SocialScheduler effectively</p>
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Getting Started
                </CardTitle>
                <CardDescription>Learn the basics of SocialScheduler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Create your first post</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to create and schedule your first social media post across platforms.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">2. Connect your accounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your social media accounts to enable direct posting and analytics.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">3. Understand the dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate through the dashboard to access all features and functionalities.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Platform-Specific Guides
                </CardTitle>
                <CardDescription>Optimize content for each platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Instagram Best Practices</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn about optimal image sizes, hashtag strategies, and posting times.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">TikTok Content Strategy</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand TikTok's algorithm and create engaging short-form videos.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">YouTube Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimize your YouTube videos for better discoverability and engagement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Advanced Features
              </CardTitle>
              <CardDescription>Get the most out of SocialScheduler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Analytics & Reporting</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to interpret analytics data and generate custom reports for your content performance.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Content Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the calendar view to plan your content strategy and maintain a consistent posting schedule.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Bulk Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Save time by scheduling multiple posts at once across different platforms.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Invite team members and collaborate on content creation and scheduling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I connect my social media accounts?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Go to Settings &gt; Social Connections and click on the "Connect" button next to each platform.
                      You'll be redirected to authenticate with each platform and grant necessary permissions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I schedule the same post across multiple platforms?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Yes! When creating a post, you can select multiple platforms and customize the content for each
                      one before scheduling. This allows you to optimize your message for each platform while saving
                      time.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How far in advance can I schedule posts?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      You can schedule posts up to 6 months in advance on our standard plan. Enterprise users can
                      schedule posts up to 1 year in advance.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I edit a post after it's scheduled?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Yes, you can edit any scheduled post before it's published. Simply go to the Calendar or Scheduled
                      tab, find your post, and click Edit. You can modify all aspects of the post including content,
                      media, and scheduled time.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>How accurate are the analytics?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Our analytics data is pulled directly from each platform's API and is updated every 24 hours. The
                      accuracy depends on what each platform provides through their API. For the most detailed
                      analytics, we recommend connecting your accounts.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Getting Started Tutorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <Video className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  A complete walkthrough of SocialScheduler's core features and how to get started.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Content Calendar Tutorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <Video className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Learn how to effectively use the content calendar for planning your social media strategy.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Analytics Deep Dive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <Video className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Understand how to interpret analytics data and use insights to improve your content strategy.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our support team is available Monday through Friday, 9am-5pm EST. We typically respond within 24 hours.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-muted-foreground">support@socialscheduler.com</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Live Chat</h3>
                  <p className="text-sm text-muted-foreground">Available during business hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
