'use client'

import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Construction } from 'lucide-react'

export default function ChatbotPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="المساعد الذكي"
        description="شات بوت المساعدة الذكية"
      />

      <Card>
        <CardBody>
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Construction className="h-16 w-16 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">قيد التطوير</h3>
            <p className="text-sm">هذه الصفحة قيد التطوير وستكون متاحة قريباً</p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
