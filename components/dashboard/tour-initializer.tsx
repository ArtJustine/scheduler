"use client"

import { useState, useEffect } from "react"
import { checkTourStatus } from "@/lib/firebase/auth"
import { AppTour } from "./app-tour"

export function TourInitializer() {
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    const initTour = async () => {
      // Check localStorage first for immediate results
      const localStatus = localStorage.getItem("chiyu-tour-completed")
      if (localStatus === "true") {
        return
      }

      const completed = await checkTourStatus()
      if (!completed) {
        // Delay a bit for full layout mount and sidebar animations
        const timer = setTimeout(() => setShowTour(true), 1500)
        return () => clearTimeout(timer)
      } else {
        // Sync local storage if Firestore says it's completed
        localStorage.setItem("chiyu-tour-completed", "true")
      }
    }
    initTour()
  }, [])

  if (!showTour) return null

  return <AppTour />
}
