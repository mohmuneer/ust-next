'use client'

import { useState, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userPermissionsService, rolePagePermissionsService } from '@/services/roles.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Eye, ChevronDown, ChevronLeft } from 'lucide-react'
import { SYSTEM_PAGES } from '@/lib/page-permissions'
import type { PagePermissionsMap } from '@/lib/page-permissions'

const ACTIONS = [
  { key: 'can_view' as const, label: 'عرض' },
  { key: 'can_add' as const, label: 'إضافة' },
  { key: 'can_edit' as const, label: 'تعديل' },
  { key: 'can_delete' as const, label: 'حذف' },
]

export default function UserPermissionsPage() {
  const [expandedUser, setExpandedUser] = useState<number | null>(null)

  const { data: userPerms } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => userPermissionsService.getAll(),
  })

  const { data: userPagePerms } = useQuery({
    queryKey: ['user-page-permissions', expandedUser],
    queryFn: () => rolePagePermissionsService.getByUser(expandedUser!),
    enabled: expandedUser != null,
  })

  const toggleExpand = (userId: number) => {
    setExpandedUser((prev) => (prev === userId ? null : userId))
  }

  const groupPages = () => {
    const g: Record<string, typeof SYSTEM_PAGES> = {}
    for (const p of SYSTEM_PAGES) {
      if (!g[p.group]) g[p.group] = []
      g[p.group].push(p)
    }
    return g
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="صلاحيات المستخدمين"
        description="عرض جميع صلاحيات المستخدمين في النظام"
      />

      <div className="space-y-3">
        {(userPerms || []).map((up: any) => {
          const isExpanded = expandedUser === up.user_id
          return (
            <Card key={up.user_id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{up.full_name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {up.role_names ? up.role_names.split(', ').map((r: string) => (
                          <Badge key={r} variant="default" className="text-xs">{r}</Badge>
                        )) : (
                          <span className="text-xs text-muted-foreground">لا يوجد أدوار</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(up.user_id)}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    عرض الصلاحيات
                    {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase w-1/3">الصفحة</th>
                          {ACTIONS.map((a) => (
                            <th key={a.key} className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase">{a.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {Object.entries(groupPages()).map(([group, pages]) => (
                          <Fragment key={group}>
                            <tr className="bg-muted/20">
                              <td className="px-4 py-2 text-sm font-bold text-foreground" colSpan={5}>{group}</td>
                            </tr>
                            {pages.map((page) => {
                              const perms = (userPagePerms || {})[page.key]
                              return (
                                <tr key={page.key} className="hover:bg-muted/30 transition-colors">
                                  <td className="px-4 py-3 text-sm">{page.label}</td>
                                  {ACTIONS.map((a) => {
                                    const checked = perms?.[a.key] || false
                                    return (
                                      <td key={a.key} className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${
                                          checked ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground/40'
                                        }`}>
                                          {checked ? '✓' : '—'}
                                        </span>
                                      </td>
                                    )
                                  })}
                                </tr>
                              )
                            })}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
