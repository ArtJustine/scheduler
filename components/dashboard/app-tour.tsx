"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react"
import { completeTour } from "@/lib/firebase/auth"
import { cn } from "@/lib/utils"

interface TourStep {
  targetId?: string
  title: string
  content: string
  action?: () => void
  position?: "top" | "bottom" | "left" | "right" | "center"
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Chiyu! ✨",
    content: "Your all-in-one command center for social media scheduling. Let's take a quick 1-minute tour to get you started.",
    position: "center"
  },
  {
    targetId: "tour-dashboard",
    title: "Dashboard Overview",
    content: "Monitor your upcoming posts, recent activity, and overall social performance from one unified view.",
    position: "right"
  },
  {
    targetId: "tour-workspace-switcher",
    title: "Manage Workspaces",
    content: "Running multiple brands or clients? Switch between isolated workspaces seamlessly right here.",
    position: "right"
  },
  {
    targetId: "tour-create-post",
    title: "Create Viral Content",
    content: "Craft and schedule your next post. Don't forget to try our built-in image cropping tool for the perfect aspect ratio!",
    position: "right",
    action: () => {} // Can be used to navigate if needed
  },
  {
    targetId: "tour-calendar",
    title: "Visual Content Calendar",
    content: "See your entire posting pipeline at a glance and drag-and-drop to reschedule your content library.",
    position: "right"
  },
  {
    targetId: "tour-connections",
    title: "Link Your Channels",
    content: "The most important step! Connect your Instagram, TikTok, and YouTube accounts to start auto-publishing.",
    position: "right"
  },
  {
    title: "You're All Set! 🚀",
    content: "You've completed the tour. Time to supercharge your social media game. Happy scheduling!",
    position: "center"
  }
]

export function AppTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const updateTargetRect = () => {
      const step = TOUR_STEPS[currentStep]
      if (step.targetId) {
        const element = document.getElementById(step.targetId)
        if (element) {
          setTargetRect(element.getBoundingClientRect())
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
          setTargetRect(null)
        }
      } else {
        setTargetRect(null)
      }
    }

    updateTargetRect()
    window.addEventListener('resize', updateTargetRect)
    return () => window.removeEventListener('resize', updateTargetRect)
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentStep + 1]
      if (nextStep.action) nextStep.action()
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    completeTour()
  }

  if (!isVisible) return null

  const step = TOUR_STEPS[currentStep]
  const isLastStep = currentStep === TOUR_STEPS.length - 1
  const isFirstStep = currentStep === 0
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Background Overlay with Dim effect */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
          onClick={handleSkip}
        />
      </AnimatePresence>

      {/* Spotlight Effect */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            layoutId="spotlight"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute rounded-xl bg-white/10 ring-[2000px] ring-black/40 shadow-[0_0_0_8px_rgba(255,255,255,0.2)] z-10"
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          style={{
            position: targetRect ? "absolute" : "relative",
            top: targetRect ? targetRect.top + targetRect.height + 24 : "auto",
            left: targetRect ? targetRect.left + (targetRect.width / 2) : "auto",
            transform: targetRect ? "translateX(-50%)" : "none"
          }}
          className={cn(
            "w-full max-w-sm pointer-events-auto z-20 mx-4",
            !targetRect && "relative"
          )}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-primary/20 p-6 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  {isLastStep ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Tutorial Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              {!isLastStep && (
                <button 
                  onClick={handleSkip}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
              )}
            </div>

            <h3 className="text-lg font-bold mb-2 dark:text-white">{step.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {step.content}
            </p>

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBack}
                    className="h-9 px-4 rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleNext}
                className="h-9 px-6 rounded-full font-bold shadow-lg shadow-primary/20"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
