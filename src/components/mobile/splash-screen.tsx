"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { useStudentAuthStore } from "@/store/useStudentAuthStore"
import { useEmployeeAuthStore } from "@/store/useEmployeeAuthStore"

interface SplashScreenProps {
  variant?: "student" | "faculty"
  onComplete?: () => void
}

export default function SplashScreen({
  variant = "student",
  onComplete,
}: SplashScreenProps) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  const handleComplete = useCallback(() => {
    onComplete?.()
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`splash-shown-${variant}`, "1")
    }
  }, [variant, onComplete])

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 2000)

    const completeTimer = setTimeout(() => {
      setVisible(false)
      handleComplete()
    }, 2500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [handleComplete])

  if (!visible) return null

  const isStudent = variant === "student"

  return (
    <>
      <style>{`
        .splash-screen {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: ${isStudent
            ? "linear-gradient(135deg, #038ed3, #025a87)"
            : "linear-gradient(135deg, #025a87, #038ed3)"};
          opacity: 0;
          animation: splashFadeIn 0.5s ease-out forwards;
          transition: opacity 0.4s ease, transform 0.4s ease;
          user-select: none;
          -webkit-user-select: none;
        }

        .splash-screen--fading {
          opacity: 0;
          transform: scale(1.05);
        }

        .splash-logo {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: splashPulse 2s ease-in-out infinite;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .splash-logo img {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }

        .splash-university-name {
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          line-height: 1.4;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          margin: 0;
          padding: 0 32px;
        }

        .splash-app-name {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .splash-spinner {
          position: absolute;
          bottom: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: splashSpin 1s linear infinite;
        }

        .splash-spinner svg {
          width: 32px;
          height: 32px;
          color: #ffffff;
        }

        @keyframes splashFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes splashPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes splashSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div
        className={`splash-screen ${fading ? "splash-screen--fading" : ""}`}
      >
        <div className="splash-logo">
          <img
            src="/ust-logo.png"
            alt="جامعة العلوم والتكنولوجيا"
            width={80}
            height={80}
          />
        </div>

        <p className="splash-university-name">جامعة العلوم والتكنولوجيا</p>
        <p className="splash-app-name">{isStudent ? "UST Student" : "UST Faculty"}</p>

        <div className="splash-spinner">
          <Loader2 />
        </div>
      </div>
    </>
  )
}
