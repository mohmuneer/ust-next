'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { systemService, type SystemVisualsData } from '@/services/system.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Save, RotateCcw, Palette, Type, Columns, Heading1, MousePointer2, Plus, Printer, Trash2, CreditCard, Loader2 } from 'lucide-react'
import { applyThemeStyles } from '@/components/theme-provider'

const FONTS = [
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Almarai', label: 'Almarai' },
  { value: 'Noto Kufi Arabic', label: 'Noto Kufi Arabic' },
  { value: 'Readex Pro', label: 'Readex Pro' },
]

const DEFAULTS = {
  id: 1,
  system_font: 'Cairo',
  sidebar_color: '#343a40',
  header_color: '#ffffff',
  main_color: '#007bff',
  add_btn_color: '#28a745',
  print_btn_color: '#17a2b8',
  delete_btn_color: '#dc3545',
  card_color: '#007bff',
} as SystemVisualsData

export default function SystemVisualsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<SystemVisualsData>(DEFAULTS)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['system-visuals'],
    queryFn: () => systemService.getVisuals(),
  })

  useEffect(() => {
    if (data) {
      const raw = Array.isArray(data) ? data[0] || {} : data
      const merged: SystemVisualsData = { ...DEFAULTS, ...raw }
      setForm(merged)
      applyThemeStyles(merged)
    }
  }, [data])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const updateMutation = useMutation({
    mutationFn: () => systemService.updateVisuals(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-visuals'] })
      applyThemeStyles(form)
      showMsg('success', 'تم حفظ الثيم بنجاح ✓')
    },
    onError: () => showMsg('error', 'فشل حفظ الثيم'),
  })

  const handleChange = (field: keyof SystemVisualsData, value: string | number) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    applyThemeStyles(updated)
  }

  const resetDefaults = () => {
    setForm(DEFAULTS)
    applyThemeStyles(DEFAULTS)
    showMsg('success', 'تم استعادة الإعدادات الافتراضية')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
        title="ثيمات وألوان النظام"
        description="تخصيص ألوان وخطوط واجهة النظام - معاينة فورية"
      />

      {msg && (
        <div className={`px-4 py-3 rounded-lg border text-sm ${
          msg.type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-danger/10 border-danger/30 text-danger'
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Font */}
            <Card>
              <CardBody>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Type className="h-5 w-5 text-primary" /> الخطوط
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2">خط النظام</label>
                  <select
                    value={form.system_font}
                    onChange={(e) => handleChange('system_font', e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                    style={{ fontFamily: form.system_font }}
                  >
                    {FONTS.map((f) => (
                      <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    يتطلب الخط تحميله من Google Fonts
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Main colors */}
            <Card>
              <CardBody>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-primary" /> الألوان الأساسية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorField
                    icon={<Columns className="h-4 w-4" />}
                    label="لون القائمة الجانبية"
                    field="sidebar_color"
                    value={form.sidebar_color}
                    onChange={handleChange}
                  />
                  <ColorField
                    icon={<Heading1 className="h-4 w-4" />}
                    label="لون الترويسة"
                    field="header_color"
                    value={form.header_color}
                    onChange={handleChange}
                  />
                  <ColorField
                    icon={<MousePointer2 className="h-4 w-4" />}
                    label="اللون الأساسي (الأزرار)"
                    field="main_color"
                    value={form.main_color}
                    onChange={handleChange}
                  />
                  <ColorField
                    icon={<CreditCard className="h-4 w-4" />}
                    label="لون حدود البطاقة"
                    field="card_color"
                    value={form.card_color}
                    onChange={handleChange}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Button colors */}
            <Card>
              <CardBody>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <MousePointer2 className="h-5 w-5 text-primary" /> ألوان الأزرار
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ColorField
                    icon={<Plus className="h-4 w-4" />}
                    label="زر الإضافة"
                    field="add_btn_color"
                    value={form.add_btn_color}
                    onChange={handleChange}
                  />
                  <ColorField
                    icon={<Printer className="h-4 w-4" />}
                    label="زر الطباعة"
                    field="print_btn_color"
                    value={form.print_btn_color}
                    onChange={handleChange}
                  />
                  <ColorField
                    icon={<Trash2 className="h-4 w-4" />}
                    label="زر الحذف"
                    field="delete_btn_color"
                    value={form.delete_btn_color}
                    onChange={handleChange}
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar preview */}
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-primary" /> معاينة حية
                </h3>
                <LivePreview form={form} />
              </CardBody>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" size="lg" className="w-full" isLoading={updateMutation.isPending}>
                <Save className="h-5 w-5 ml-2" /> حفظ الثيم
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={resetDefaults}>
                <RotateCcw className="h-5 w-5 ml-2" /> استعادة الإفتراضي
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function ColorField({ icon, label, field, value, onChange }: {
  icon: React.ReactNode
  label: string
  field: keyof SystemVisualsData
  value: string
  onChange: (f: keyof SystemVisualsData, v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value ?? ''}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-10 w-14 rounded border border-border cursor-pointer bg-background p-0.5"
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(field, e.target.value)}
          className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-sm font-mono"
          placeholder="#000000"
          dir="ltr"
        />
      </div>
    </div>
  )
}

function LivePreview({ form }: { form: SystemVisualsData }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ fontFamily: form.system_font }}>
      {/* Header preview */}
      <div className="h-10 flex items-center px-4 text-xs font-medium gap-4" style={{ backgroundColor: form.header_color }}>
        <span style={{ color: getContrastColor(form.header_color) }}>الرئيسية</span>
        <span style={{ color: getContrastColor(form.header_color) }}>النظام</span>
        <span style={{ color: getContrastColor(form.header_color) }}>الإعدادات</span>
      </div>
      <div className="flex min-h-[200px]">
        {/* Sidebar preview */}
        <div className="w-1/3 p-3 space-y-2" style={{ backgroundColor: form.sidebar_color }}>
          {['لوحة التحكم', 'المستخدمين', 'التقارير'].map((item) => (
            <div
              key={item}
              className="text-xs px-2 py-1.5 rounded"
              style={{
                backgroundColor: `${form.main_color}22`,
                color: getContrastColor(form.sidebar_color),
              }}
            >
              {item}
            </div>
          ))}
        </div>
        {/* Content preview */}
        <div className="flex-1 p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
          <div className="h-6 rounded w-3/4" style={{ backgroundColor: form.card_color }} />
          <div className="flex gap-2">
            <span className="text-xs px-3 py-1.5 rounded text-white" style={{ backgroundColor: form.main_color }}>
              زر أساسي
            </span>
            <span className="text-xs px-3 py-1.5 rounded text-white" style={{ backgroundColor: form.add_btn_color }}>
              <Plus className="h-3 w-3 inline ml-1" />إضافة
            </span>
            <span className="text-xs px-3 py-1.5 rounded text-white" style={{ backgroundColor: form.print_btn_color }}>
              <Printer className="h-3 w-3 inline ml-1" />طباعة
            </span>
            <span className="text-xs px-3 py-1.5 rounded text-white" style={{ backgroundColor: form.delete_btn_color }}>
              <Trash2 className="h-3 w-3 inline ml-1" />حذف
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded border-2 p-1.5 flex flex-col justify-end"
                style={{
                  borderColor: form.card_color,
                  backgroundColor: `${form.card_color}08`,
                }}
              >
                <div className="h-1.5 rounded w-3/4 mb-1" style={{ backgroundColor: form.card_color + '44' }} />
                <div className="h-1.5 rounded w-1/2" style={{ backgroundColor: form.card_color + '44' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getContrastColor(hex: string): string {
  if (!hex || hex.length < 6) return '#000'
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#ffffff'
}
