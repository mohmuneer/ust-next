"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

interface BottomNavProps {
  items: Array<{
    label: string
    icon: any
    href: string
    badge?: number
  }>
  activeHref: string
}

export default function BottomNav({ items, activeHref }: BottomNavProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(64px + env(safe-area-inset-bottom, 0px));
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background: var(--bg-bottom-nav, #ffffff);
          border-top: 1px solid var(--border-bottom-nav, rgba(0, 0, 0, 0.08));
          z-index: 9999;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        [dir="rtl"] .bottom-nav {
          direction: rtl;
        }

        .bottom-nav__list {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 64px;
          list-style: none;
          margin: 0;
          padding: 0;
          max-width: 500px;
          margin: 0 auto;
        }

        .bottom-nav__item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          position: relative;
        }

        .bottom-nav__link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          width: 100%;
          height: 100%;
          text-decoration: none;
          color: var(--text-bottom-nav, #6b7280);
          transition: color 0.25s ease, transform 0.2s ease;
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }

        .bottom-nav__link:active {
          transform: scale(0.92);
        }

        .bottom-nav__icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bottom-nav__link--active .bottom-nav__icon-wrap {
          transform: scale(1.12);
        }

        .bottom-nav__icon {
          width: 24px;
          height: 24px;
          stroke-width: 2;
          transition: color 0.25s ease, filter 0.25s ease;
        }

        .bottom-nav__link--active .bottom-nav__icon {
          color: var(--color-primary, #038ed3);
          filter: drop-shadow(0 1px 4px rgba(3, 142, 211, 0.3));
        }

        .bottom-nav__label {
          font-size: 10px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.01em;
          transition: color 0.25s ease, font-weight 0.25s ease;
          white-space: nowrap;
        }

        .bottom-nav__link--active .bottom-nav__label {
          color: var(--color-primary, #038ed3);
          font-weight: 700;
        }

        .bottom-nav__badge {
          position: absolute;
          top: -2px;
          right: -6px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background: #ef4444;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          line-height: 16px;
          text-align: center;
          border-radius: 9999px;
          box-shadow: 0 1px 3px rgba(239, 68, 68, 0.4);
          animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bottom-nav__badge--hidden {
          display: none;
        }

        @keyframes badge-pop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        .bottom-nav__active-pill {
          position: absolute;
          top: 4px;
          width: 36px;
          height: 3px;
          border-radius: 9999px;
          background: var(--color-primary, #038ed3);
          opacity: 0;
          transition: opacity 0.25s ease, transform 0.25s ease;
          transform: scaleX(0.6);
        }

        .bottom-nav__link--active .bottom-nav__active-pill {
          opacity: 1;
          transform: scaleX(1);
        }

        /* Dark mode */
        [data-theme="dark"] .bottom-nav {
          --bg-bottom-nav: #1a1d23;
          --border-bottom-nav: rgba(255, 255, 255, 0.08);
          --text-bottom-nav: #6b7280;
        }

        [data-theme="dark"] .bottom-nav__link:not(.bottom-nav__link--active) {
          --text-bottom-nav: #9ca3af;
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .bottom-nav {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
        <ul className="bottom-nav__list">
          {items.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <li key={item.href} className="bottom-nav__item">
                <Link
                  href={item.href}
                  className={`bottom-nav__link ${active ? "bottom-nav__link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  prefetch={false}
                >
                  <span className="bottom-nav__active-pill" />
                  <span className="bottom-nav__icon-wrap">
                    <Icon className="bottom-nav__icon" />
                    <span
                      className={`bottom-nav__badge ${
                        item.badge && item.badge > 0 ? "" : "bottom-nav__badge--hidden"
                      }`}
                      aria-label={`${item.badge} notifications`}
                    >
                      {item.badge && item.badge > 99 ? "99+" : item.badge}
                    </span>
                  </span>
                  <span className="bottom-nav__label">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
