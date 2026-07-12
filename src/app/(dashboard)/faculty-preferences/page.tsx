'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Pencil, Clock } from 'lucide-react'
import { facultyPreferencesService } from '@/services/faculty-preferences.service'
import { employeesService } from '@/services/employees.service'
import { buildingsService } from '@/services/buildings.service'
import type { FacultyPreference } from '@/types'

const DAYS = ['saturday','sunday','monday','tuesday','wednesday','thursday']
const DAY_LABELS: Record<string,string> = {saturday:'السبت',sunday:'الأحد',monday:'الإثنين',tuesday:'الثلاثاء',wednesday:'الأربعاء',thursday:'الخميس'}

export default function FacultyPreferencesPage() {
  const qc = useQueryClient()
  const [show,setShow]=useState(false); const [edit,setEdit]=useState<FacultyPreference|null>(null)
  const [form,setForm]=useState<Record<string,unknown>>({})
  const {data:prefs=[]}=useQuery({queryKey:['faculty-preferences'],queryFn:()=>facultyPreferencesService.getAll()})
  const {data:employees}=useQuery({queryKey:['employees'],queryFn:()=>employeesService.getAll()})
  const {data:buildings}=useQuery({queryKey:['buildings'],queryFn:()=>buildingsService.getAll()})

  const upsertM=useMutation({
    mutationFn:()=>facultyPreferencesService.upsert(form),
    onSuccess:()=>{qc.invalidateQueries({queryKey:['faculty-preferences']});handleClose()}
  })

  function openEdit(p:FacultyPreference){setEdit(p);setForm({...p});setShow(true)}
  function handleClose(){setShow(false);setEdit(null);setForm({})}
  function handleSave(){upsertM.mutate()}

  const empOpts=(employees||[]).map(e=>({value:e.id,label:e.full_name}))
  const bldOpts=(buildings||[]).map(b=>({value:b.id,label:b.building_name}))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تفضيلات أعضاء هيئة التدريس</h1>
          <p className="text-sm text-muted-foreground mt-1">تحديد العبء التدريسي والأوقات المفضلة</p>
        </div>
      </div>
      <DataTable
        columns={[
          {key:'employee_name',label:'عضو هيئة التدريس'},
          {key:'max_hours_per_week',label:'الحد الأقصى/أسبوع',render:(r:FacultyPreference)=>`${r.max_hours_per_week} س`},
          {key:'max_hours_per_day',label:'الحد الأقصى/يوم',render:(r:FacultyPreference)=>`${r.max_hours_per_day} س`},
          {key:'preferred_start_time',label:'وقت البداية المفضل',render:(r:FacultyPreference)=>r.preferred_start_time?.slice(0,5)},
          {key:'preferred_end_time',label:'وقت النهاية المفضل',render:(r:FacultyPreference)=>r.preferred_end_time?.slice(0,5)},
          {key:'break_day',label:'يوم الراحة',render:(r:FacultyPreference)=>r.break_day?DAY_LABELS[r.break_day]||r.break_day:'—'},
        ]}
        data={prefs}
        actions={(r:FacultyPreference)=>(
          <Button variant="ghost" size="sm" onClick={()=>openEdit(r)}><Pencil className="h-4 w-4" /></Button>
        )}
      />
      <Modal isOpen={show} onClose={handleClose} title={edit?'تعديل التفضيلات':'إضافة تفضيلات'}>
        <div className="space-y-4">
          <SearchableSelect label="عضو هيئة التدريس" value={form.employee_id as number||0} onChange={(v)=>setForm({...form,employee_id:Number(v)})} placeholder="اختر الموظف..." options={empOpts} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="الحد الأقصى للساعات/أسبوع" type="number" value={form.max_hours_per_week as string||'18'} onChange={(e)=>setForm({...form,max_hours_per_week:e.target.value})} />
            <Input label="الحد الأقصى للساعات/يوم" type="number" value={form.max_hours_per_day as string||'6'} onChange={(e)=>setForm({...form,max_hours_per_day:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="وقت البداية المفضل" type="time" value={form.preferred_start_time as string||'08:00'} onChange={(e)=>setForm({...form,preferred_start_time:e.target.value})} />
            <Input label="وقت النهاية المفضل" type="time" value={form.preferred_end_time as string||'16:00'} onChange={(e)=>setForm({...form,preferred_end_time:e.target.value})} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">الأيام المتاحة</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d=>{
                const days=((form.available_days as string)||'').split(',').filter(Boolean)
                const checked=days.includes(d)
                return (
                  <label key={d} className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="checkbox" checked={checked} onChange={()=>{
                      const next=checked?days.filter(x=>x!==d):[...days,d]
                      setForm({...form,available_days:next.join(',')})
                    }} className="rounded" />
                    {DAY_LABELS[d]}
                  </label>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">يوم الراحة</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.break_day as string||''} onChange={(e)=>setForm({...form,break_day:e.target.value})}>
                <option value="">—</option>
                {DAYS.map(d=><option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
            </div>
            <SearchableSelect label="المبنى المفضل" value={form.preferred_building_id as number||0} onChange={(v)=>setForm({...form,preferred_building_id:Number(v)})} placeholder="اختر المبنى..." options={bldOpts} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">ملاحظات</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.notes as string||''} onChange={(e)=>setForm({...form,notes:e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={upsertM.isPending}><Clock className="ml-2 h-4 w-4" />حفظ التفضيلات</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
