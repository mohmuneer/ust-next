'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { lecturesService } from '@/services/lectures.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { studyGroupsService } from '@/services/study-groups.service'
import { studyLevelsService } from '@/services/study-levels.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { employeesService } from '@/services/employees.service'
import { externalEmployeesService } from '@/services/external-employees.service'
import { roomsService } from '@/services/rooms.service'
import { programsService } from '@/services/programs.service'
import type { Lecture } from '@/types'

const DAY_LABELS: Record<string,string>={saturday:'السبت',sunday:'الأحد',monday:'الإثنين',tuesday:'الثلاثاء',wednesday:'الأربعاء',thursday:'الخميس'}
const LECTURE_TYPES=['theory','practical','lab']
const LECTURE_TYPE_LABELS:Record<string,string>={theory:'نظرية',practical:'عملية',lab:'مختبر'}
const STATUS_OPTS=[{value:'scheduled',label:'مجدول'},{value:'cancelled',label:'ملغي'},{value:'completed',label:'مكتمل'},{value:'rescheduled',label:'معاد جدولته'}]

export default function LecturesPage() {
  const qc=useQueryClient()
  const [show,setShow]=useState(false);const[edit,setEdit]=useState<Lecture|null>(null)
  const [form,setForm]=useState<Record<string,unknown>>({})
  const [semesterFilter,setSemesterFilter]=useState(0)

  const {data:lectures=[]}=useQuery({queryKey:['lectures',semesterFilter],queryFn:()=>semesterFilter>0?lecturesService.getBySemester(semesterFilter):Promise.resolve([]),enabled:semesterFilter>0})
  const {data:subjects}=useQuery({queryKey:['study-subjects'],queryFn:()=>studySubjectsService.getAll()})
  const {data:groups}=useQuery({queryKey:['study-groups'],queryFn:()=>studyGroupsService.getAll()})
  const {data:levels}=useQuery({queryKey:['study-levels'],queryFn:()=>studyLevelsService.getAll()})
  const {data:semesters}=useQuery({queryKey:['academic-semesters'],queryFn:()=>academicSemestersService.getAll()})
  const {data:employees}=useQuery({queryKey:['employees'],queryFn:()=>employeesService.getAll()})
  const {data:externals}=useQuery({queryKey:['external-employees'],queryFn:()=>externalEmployeesService.getAll()})
  const {data:rooms}=useQuery({queryKey:['rooms'],queryFn:()=>roomsService.getAll()})
  const {data:programs}=useQuery({queryKey:['programs'],queryFn:()=>programsService.getAll()})

  const createM=useMutation({mutationFn:()=>lecturesService.create(form),onSuccess:()=>{qc.invalidateQueries({queryKey:['lectures']});handleClose()}})
  const updateM=useMutation({mutationFn:()=>lecturesService.update(edit!.id,form),onSuccess:()=>{qc.invalidateQueries({queryKey:['lectures']});handleClose()}})
  const deleteM=useMutation({mutationFn:(id:number)=>lecturesService.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['lectures']})})

  function openAdd(){setEdit(null);setForm({academic_semester_id:semesterFilter,lecture_type:'theory',status:'scheduled',day_of_week:'',start_time:'',end_time:'',study_subject_id:0,employee_id:0,room_id:0});setShow(true)}
  function openEdit(l:Lecture){setEdit(l);setForm({...l});setShow(true)}
  function handleClose(){setShow(false);setEdit(null);setForm({})}

  const subOpts=(subjects||[]).map(s=>({value:s.id,label:`${s.subject_name}${s.subject_code?` - ${s.subject_code}`:''}`}))
  const empOpts=(employees||[]).map(e=>({value:e.id,label:e.full_name}))
  const extOpts=(externals||[]).map(e=>({value:e.id,label:`${e.full_name} (متعاقد)`}))
  const roomOpts=(rooms||[]).map(r=>({value:r.id,label:`${r.room_name} (${r.building_name||''})`}))
  const semOpts=(semesters||[]).map(s=>({value:s.id,label:s.is_current?`${s.semester_name} ★`:s.semester_name}))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المحاضرات</h1>
        {semesterFilter>0&&<Button onClick={openAdd}><Plus className="ml-2 h-4 w-4" />إضافة محاضرة</Button>}
      </div>
      <div className="w-64">
        <SearchableSelect label="الترم" value={semesterFilter} onChange={(v)=>setSemesterFilter(Number(v))} placeholder="اختر الترم..." options={semOpts} />
      </div>
      <DataTable
        columns={[
          {key:'subject_name',label:'المادة'},
          {key:'day_of_week',label:'اليوم',render:(r:Lecture)=>DAY_LABELS[r.day_of_week]||r.day_of_week},
          {key:'start_time',label:'البداية'},
          {key:'end_time',label:'النهاية'},
          {key:'lecture_type',label:'النوع',render:(r:Lecture)=>LECTURE_TYPE_LABELS[r.lecture_type]||r.lecture_type},
          {key:'employee_name',label:'المدرس'},
          {key:'room_name',label:'القاعة'},
          {key:'status',label:'الحالة',render:(r:Lecture)=>{
            const colors:Record<string,string>={scheduled:'default',cancelled:'danger',completed:'success',rescheduled:'warning'}
            return <Badge variant={colors[r.status] as 'default'|'danger'|'success'|'warning'}>{STATUS_OPTS.find(s=>s.value===r.status)?.label||r.status}</Badge>
          }},
        ]}
        data={lectures}
        actions={(r:Lecture)=>(
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={()=>openEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={()=>{if(confirm('حذف المحاضرة؟'))deleteM.mutate(r.id)}}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Modal isOpen={show} onClose={handleClose} title={edit?'تعديل محاضرة':'إضافة محاضرة'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect label="المادة" value={form.study_subject_id as number||0} onChange={(v)=>setForm({...form,study_subject_id:Number(v)})} placeholder="اختر المادة..." options={subOpts} />
            <div>
              <label className="mb-1 block text-sm font-medium">نوع المحاضرة</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.lecture_type as string||'theory'} onChange={(e)=>setForm({...form,lecture_type:e.target.value})}>
                {LECTURE_TYPES.map(t=><option key={t} value={t}>{LECTURE_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">اليوم</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.day_of_week as string||''} onChange={(e)=>setForm({...form,day_of_week:e.target.value})}>
                <option value="">اختر اليوم</option>
                {Object.entries(DAY_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <SearchableSelect label="البرنامج" value={form.program_id as number||0} onChange={(v)=>setForm({...form,program_id:Number(v)})} placeholder="اختر البرنامج..." options={(programs||[]).map(p=>({value:p.id,label:p.program_name}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="وقت البداية" type="time" value={form.start_time as string||''} onChange={(e)=>setForm({...form,start_time:e.target.value})} />
            <Input label="وقت النهاية" type="time" value={form.end_time as string||''} onChange={(e)=>setForm({...form,end_time:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect label="المدرس (موظف)" value={form.employee_id as number||0} onChange={(v)=>setForm({...form,employee_id:Number(v)})} placeholder="اختر الموظف..." options={empOpts} />
            <SearchableSelect label="مدرس خارجي" value={form.external_employee_id as number||0} onChange={(v)=>setForm({...form,external_employee_id:Number(v)})} placeholder="اختر المتعاقد..." options={extOpts} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect label="القاعة" value={form.room_id as number||0} onChange={(v)=>setForm({...form,room_id:Number(v)})} placeholder="اختر القاعة..." options={roomOpts} />
            <SearchableSelect label="المستوى" value={form.study_level_id as number||0} onChange={(v)=>setForm({...form,study_level_id:Number(v)})} placeholder="اختر المستوى..." options={(levels||[]).map(l=>({value:l.id,label:l.level_name}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect label="الشعبة" value={form.study_group_id as number||0} onChange={(v)=>setForm({...form,study_group_id:Number(v)})} placeholder="اختر الشعبة..." options={(groups||[]).map(g=>({value:g.id,label:`${g.group_name} (${g.group_type})`}))} />
            <div>
              <label className="mb-1 block text-sm font-medium">الحالة</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status as string||'scheduled'} onChange={(e)=>setForm({...form,status:e.target.value})}>
                {STATUS_OPTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">ملاحظات</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.notes as string||''} onChange={(e)=>setForm({...form,notes:e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={()=>{if(edit)updateM.mutate();else createM.mutate()}} isLoading={createM.isPending||updateM.isPending}>{edit?'حفظ':'إضافة'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
