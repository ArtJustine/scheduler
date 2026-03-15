"use client"

import { useState, useEffect } from "react"
import { checkTourStatus } from "@/lib/firebase/auth"
import { AppTour } from "./app-tour"

export function TourInitializer() {
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    const initTour = async () => {
      const completed = await checkTourStatus()
      if (!completed) {
        // Delay a bit for full layout mount and sidebar animations
        const timer = setTimeout(() => setShowTour(true), 1500)
        return () => clearTimeout(timer)
      }
    }
    initTour()
  }, [])

  if (!showTour) return null

  return <AppTour />
}
