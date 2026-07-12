'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/components/theme-provider'
import { PermissionsProvider, PermissionGuard } from '@/hooks/use-permissions'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { SWRegistration } from '@/components/sw-registration'
import { PWAInstallBanner } from '@/components/pwa-install-banner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)

  return (
    <ThemeProvider>
      <PermissionsProvider>
      <SWRegistration manifestPath="/manifest-employee.json" />
      <PWAInstallBanner variant="employee" />
      <style>{`
        .print-only, .print-header { display: none; }
        @media print {
          .sidebar-wrapper, .dashboard-header { display: none !important; }
          .dashboard-main { margin-right: 0 !important; padding: 0 !important; }
          .dashboard-main > main { padding: 0 !important; }
          .overflow-x-auto { overflow: visible !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-header { display: block !important; margin-bottom: 2px; }
          .schedule-card { page-break-inside: avoid; }
          [class*="min-w-"] { min-width: auto !important; width: 100% !important; }
          body { background: white !important; font-size: 6.5pt !important; }
          .schedule-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          .schedule-card-header { padding: 1px 8px !important; }
          .schedule-card-header h2 { font-size: 9pt !important; }
          .schedule-grid-inner { min-width: auto !important; width: 100% !important; }
          .schedule-grid-inner > .grid { grid-template-columns: 45px repeat(6,1fr) !important; }
          .schedule-time-header { padding: 1px 2px !important; font-size: 6pt !important; }
          .schedule-day-header { padding: 1px 2px !important; font-size: 7pt !important; }
          .schedule-time-cell { padding: 1px 2px !important; font-size: 5.5pt !important; }
          .schedule-day-cell { min-height: auto !important; padding: 0 !important; }
          .schedule-lecture { padding: 1px 2px !important; font-size: 5.5pt !important; }
          .schedule-lecture .text-sm { font-size: 5.5pt !important; }
          .schedule-lecture .leading-tight { line-height: 1.1 !important; }
          .schedule-lecture .gap-1 { gap: 0 !important; }
          .schedule-lecture .h-3 { width: 5px !important; height: 5px !important; }
          .schedule-lecture .h-2\\.5 { width: 4px !important; height: 4px !important; }
          .schedule-lecture .w-2\\.5 { width: 4px !important; height: 4px !important; }
          .overflow-x-auto { overflow: visible !important; }
          @page { size: landscape; margin: 4mm; }
        }
      `}</style>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        <div
          className={cn(
            'dashboard-main flex flex-col pt-14 transition-all duration-[250ms] ease',
            sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-[300px]'
          )}
        >
          <main className="flex-1 p-4 lg:p-6">
            <PermissionGuard>{children}</PermissionGuard>
          </main>
        </div>
      </div>
      </PermissionsProvider>
    </ThemeProvider>
  )
}
