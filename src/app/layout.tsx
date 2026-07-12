import type { Metadata } from 'next'
import { QueryProvider } from '@/lib/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'UST | نظام إدارة البلاغات والمهام الفنية',
  description: 'جامعة العلوم والتكنولوجيا - نظام إدارة البلاغات والمهام الفنية',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UST',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#038ed3',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UST" />
        <link rel="apple-touch-icon" href="/ust-logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=function(){document.querySelectorAll('[fdprocessedid]').forEach(function(e){e.removeAttribute('fdprocessedid')})};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',c)}else{c()}new MutationObserver(c).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['fdprocessedid']})}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans" suppressHydrationWarning>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
