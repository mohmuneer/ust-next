'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { systemService, type SystemSettingsData } from '@/services/system.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Building2, Mail, Phone, MapPin, Image, Shield, Loader2 } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import { Upload } from 'lucide-react'

export default function SystemSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<SystemSettingsData>({
    id: 0, system_name: '', admin_email: '', contact_number: '',
    address: '', system_logo: '', maintenance_mode: 0,
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => systemService.getSettings(),
  })

  useEffect(() => {
    if (data) {
      setForm(data)
      if (data.system_logo) setLogoPreview(getImageUrl(data.system_logo))
    }
  }, [data])

  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000) }
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000) }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'].includes(file.type)) {
      showError('صيغة الملف غير مدعومة. الصيغ المسموحة: jpg, jpeg, png, svg')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showError('حجم الملف يجب ألا يتجاوز 2 ميجابايت')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const result = await res.json()
      if (result.filename) {
        handleChange('system_logo', result.filename)
        setLogoPreview(getImageUrl(result.filename))
        showSuccess('تم رفع الشعار بنجاح ✓')
      } else {
        showError('فشل رفع الشعار')
      }
    } catch {
      showError('فشل رفع الشعار')
    } finally {
      setUploading(false)
    }
  }

  const updateMutation = useMutation({
    mutationFn: () => systemService.updateSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      showSuccess('تم حفظ الإعدادات بنجاح ✓')
    },
    onError: () => {
      showError('فشل حفظ الإعدادات - يرجى المحاولة مرة أخرى')
    },
  })

  const handleChange = (field: keyof SystemSettingsData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.system_name.trim()) return
    updateMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إعدادات النظام"
        description="البيانات الأساسية للمؤسسة - قم بإدخال بيانات النظام العامة"
      />

      {successMsg && (
        <div className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardBody>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" /> معلومات المؤسسة
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">اسم المؤسسة *</label>
                    <Input
                      value={form.system_name}
                      onChange={(e) => handleChange('system_name', e.target.value)}
                      placeholder="أدخل اسم المؤسسة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Mail className="h-3.5 w-3.5 inline ml-1" /> البريد الإلكتروني
                    </label>
                    <Input
                      type="email"
                      value={form.admin_email}
                      onChange={(e) => handleChange('admin_email', e.target.value)}
                      placeholder="admin@ust.edu"
                      dir="ltr"
                      className="text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone className="h-3.5 w-3.5 inline ml-1" /> رقم الهاتف
                    </label>
                    <Input
                      value={form.contact_number}
                      onChange={(e) => handleChange('contact_number', e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <MapPin className="h-3.5 w-3.5 inline ml-1" /> العنوان
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm min-h-[80px]"
                      placeholder="أدخل عنوان المؤسسة"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" /> إعدادات عامة
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted/50">
                    <input
                      type="checkbox"
                      checked={form.maintenance_mode === 1}
                      onChange={(e) => handleChange('maintenance_mode', e.target.checked ? 1 : 0)}
                      className="rounded border-gray-300 h-5 w-5"
                    />
                    <div>
                      <p className="text-sm font-medium">وضع الصيانة</p>
                      <p className="text-xs text-muted-foreground">تفعيل وضع الصيانة لإخفاء النظام عن المستخدمين</p>
                    </div>
                  </label>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Logo */}
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Image className="h-5 w-5 text-primary" /> شعار النظام
                </h3>
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/50 border-2 border-dashed border-border cursor-pointer hover:bg-muted/70 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                    ) : logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="max-h-32 max-w-full object-contain" onError={() => setLogoPreview(null)} />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">اضغط لرفع شعار النظام</p>
                        <p className="text-xs mt-1">jpg, png, svg - 2MB كحد أقصى</p>
                      </div>
                    )}
                  </label>
                  {form.system_logo && (
                    <p className="text-xs text-muted-foreground text-center">
                      الملف الحالي: {form.system_logo}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={updateMutation.isPending}
              >
                <Save className="h-5 w-5 ml-2" /> حفظ الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
