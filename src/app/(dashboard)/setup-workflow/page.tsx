'use client'

import { useQuery } from '@tanstack/react-query'
import { setupWorkflowService, type SetupCounts } from '@/services/setup-workflow.service'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import {
  Building2, Layers, GraduationCap, BookOpen, CalendarDays,
  Tags, TrendingUp, Users, UserPlus, Briefcase,
  BookCopy, GitBranch, DoorOpen, ClipboardList, Clock,
  CheckCircle2, AlertTriangle, ArrowLeft, FlaskConical,
  TableProperties, Network, type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

interface Step {
  key: keyof SetupCounts
  label: string
  icon: LucideIcon
  href: string
}

interface StepGroup {
  title: string
  description: string
  icon: LucideIcon
  color: string
  steps: Step[]
}

const stepGroups: StepGroup[] = [
  {
    title: 'الإعدادات الأساسية',
    description: 'إنشاء الفروع والكليات والأقسام',
    icon: Building2,
    color: 'primary',
    steps: [
      { key: 'branches', label: 'الفروع', icon: GitBranch, href: '/branches' },
      { key: 'colleges', label: 'الكليات', icon: Building2, href: '/colleges' },
      { key: 'departments', label: 'الأقسام', icon: Layers, href: '/departments' },
    ],
  },
  {
    title: 'الموارد البشرية',
    description: 'إدارة الكوادر والموظفين',
    icon: Users,
    color: 'success',
    steps: [
      { key: 'job_titles', label: 'المسميات الوظيفية', icon: Briefcase, href: '/job-titles' },
      { key: 'admin_structures', label: 'الهيكل الإداري', icon: Network, href: '/admin-structures' },
      { key: 'employees', label: 'الموظفين', icon: Users, href: '/employees' },
      { key: 'external_employees', label: 'المتعاقدين', icon: UserPlus, href: '/external-employees' },
    ],
  },
  {
    title: 'البرامج والمواد',
    description: 'إعداد البرامج الأكاديمية والمواد',
    icon: BookOpen,
    color: 'danger',
    steps: [
      { key: 'programs', label: 'البرامج', icon: BookCopy, href: '/programs' },
      { key: 'study_levels', label: 'المستويات', icon: TrendingUp, href: '/study-levels' },
      { key: 'study_groups', label: 'المجموعات', icon: Tags, href: '/study-groups' },
      { key: 'academic_semesters', label: 'الترمات', icon: CalendarDays, href: '/academic-semesters' },
      { key: 'study_subjects', label: 'المواد', icon: BookOpen, href: '/study-subjects' },
      { key: 'plan_subjects', label: 'توزيع المواد', icon: ClipboardList, href: '/study-plans' },
      { key: 'subject_relations', label: 'العلاقات', icon: GitBranch, href: '/subject-relations' },
    ],
  },
  {
    title: 'المرافق',
    description: 'إدارة المباني والقاعات',
    icon: DoorOpen,
    color: 'info',
    steps: [
      { key: 'buildings', label: 'المباني', icon: DoorOpen, href: '/buildings' },
      { key: 'rooms', label: 'القاعات', icon: TableProperties, href: '/rooms' },
    ],
  },
  {
    title: 'الخطط والجداول',
    description: 'إعداد الخطط الدراسية والجداول',
    icon: Clock,
    color: 'warning',
    steps: [
      { key: 'study_plans', label: 'الخطط الدراسية', icon: BookCopy, href: '/study-plans' },
      { key: 'faculty_preferences', label: 'تفضيلات التدريس', icon: ClipboardList, href: '/faculty-preferences' },
      { key: 'employee_assignments', label: 'توزيع الموظفين', icon: Users, href: '/employees' },
      { key: 'study_schedules', label: 'الجداول', icon: CalendarDays, href: '/study-schedules' },
      { key: 'lectures', label: 'المحاضرات', icon: GraduationCap, href: '/lectures' },
    ],
  },
]

const totalSteps = stepGroups.reduce((sum, g) => sum + g.steps.length, 0)

function getStepStatus(count: number) {
  if (count === 0) return { label: 'لم يبدأ', variant: 'danger' as const }
  if (count < 3) return { label: 'قيد الإنشاء', variant: 'warning' as const }
  return { label: 'مكتمل', variant: 'success' as const }
}

export default function SetupWorkflowPage() {
  const { data: counts, isLoading } = useQuery({
    queryKey: ['setup-workflow-counts'],
    queryFn: () => setupWorkflowService.getAllCounts(),
    refetchInterval: 30000,
  })

  const completedSteps = counts
    ? stepGroups.reduce((sum, g) => sum + g.steps.filter((s) => (counts[s.key] || 0) >= 3).length, 0)
    : 0
  const progress = counts ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="دليل تهيئة النظام"
        description="سير العمل لإعداد النظام بالكامل - اتبع الخطوات بالترتيب"
      />

      {/* Progress Overview */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تقدم الإعداد</p>
                <p className="text-2xl font-bold">{progress}%</p>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-success to-primary transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>{completedSteps} / {totalSteps} خطوات مكتملة</span>
                <span>{isLoading ? 'جاري التحميل...' : 'آخر تحديث قبل لحظات'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {stepGroups.map((g) => {
              const groupTotal = g.steps.length
              const groupDone = counts ? g.steps.filter((s) => (counts[s.key] || 0) >= 3).length : 0
              return (
                <div key={g.title} className="flex flex-col items-center p-2 rounded-xl bg-muted/50">
                  <g.icon className="h-4 w-4 text-primary mb-0.5" />
                  <p className="text-xs font-bold">{groupDone}/{groupTotal}</p>
                  <p className="text-[10px] text-muted-foreground truncate w-full text-center">{g.title}</p>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Step Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stepGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `var(--color-${group.color}, var(--color-primary))` }}
                >
                  <group.icon className="h-4 w-4 text-white" />
                </div>
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-xs text-muted-foreground mb-4">{group.description}</p>
              <div className="space-y-2">
                {group.steps.map((step) => {
                  const count = counts?.[step.key] ?? 0
                  const status = getStepStatus(count)
                  return (
                    <Link
                      key={step.key}
                      href={step.href}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/70 transition-colors group border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <step.icon className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                        <span className="text-sm truncate">{step.label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold tabular-nums text-muted-foreground">{count}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Help Card */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">نصائح لإعداد النظام</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>اتبع الترتيب من الأعلى إلى الأسفل - كل خطوة تعتمد على ما قبلها</li>
                <li>المواد (study subjects) تحتاج إلى المستويات والمجموعات والترمات</li>
                <li>الجداول والمحاضرات تحتاج إلى الموظفين والمواد والقاعات</li>
                <li>يمكنك تعديل أي بيانات لاحقاً من خلال شاشات الإدارة</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
