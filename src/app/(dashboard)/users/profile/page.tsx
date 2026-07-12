'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { User, Mail, Shield, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { formatDateTime, getImageUrl } from '@/lib/utils'

export default function UserProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader title="الملف الشخصي" description="بيانات المستخدم" />
        <Card>
          <CardBody>
            <div className="text-center py-10 text-muted-foreground">
              يجب تسجيل الدخول لعرض الملف الشخصي
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="الملف الشخصي" description="بيانات حسابي" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardBody>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                {user.file_path ? (
                  <img src={getImageUrl(user.file_path)} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <h2 className="text-xl font-bold">{user.full_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{user.role_name || 'مستخدم'}</p>
              <div className="mt-3">
                {user.status === 1
                  ? <span className="inline-flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> نشط</span>
                  : <span className="inline-flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> غير نشط</span>
                }
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Info Card */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardBody>
              <h3 className="font-semibold mb-4">معلومات الحساب</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">الاسم</p>
                    <p className="text-sm font-medium">{user.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">الدور</p>
                    <p className="text-sm font-medium">{user.role_name || '---'}</p>
                  </div>
                </div>
                {user.created_at && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">تاريخ التسجيل</p>
                      <p className="text-sm font-medium">{formatDateTime(user.created_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
