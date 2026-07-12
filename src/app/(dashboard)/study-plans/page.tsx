'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { studyPlansService } from '@/services/study-plans.service'
import { planSubjectsService } from '@/services/plan-subjects.service'
import { programsService } from '@/services/programs.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { studyLevelsService } from '@/services/study-levels.service'
import type { StudyPlan, PlanSubject } from '@/types'

export default function StudyPlansPage() {
  const qc = useQueryClient()
  const [show,setShow]=useState(false); const [edit,setEdit]=useState<StudyPlan|null>(null)
  const [form,setForm]=useState<Record<string,unknown>>({})
  const [selectedPlan,setSelectedPlan]=useState(0)
  const [showSub,setShowSub]=useState(false); const [subForm,setSubForm]=useState<Record<string,unknown>>({})

  const {data:plans=[]}=useQuery({queryKey:['study-plans'],queryFn:()=>studyPlansService.getAll()})
  const {data:programs}=useQuery({queryKey:['programs'],queryFn:()=>programsService.getAll()})
  const {data:subjects}=useQuery({queryKey:['study-subjects'],queryFn:()=>studySubjectsService.getAll()})
  const {data:levels}=useQuery({queryKey:['study-levels'],queryFn:()=>studyLevelsService.getAll()})
  const {data:planSubjects=[]}=useQuery({queryKey:['plan-subjects',selectedPlan],queryFn:()=>planSubjectsService.getByPlan(selectedPlan),enabled:selectedPlan>0})

  const createM=useMutation({mutationFn:()=>studyPlansService.create(form),onSuccess:()=>{qc.invalidateQueries({queryKey:['study-plans']});handleClose()}})
  const updateM=useMutation({mutationFn:()=>studyPlansService.update(edit!.id,form),onSuccess:()=>{qc.invalidateQueries({queryKey:['study-plans']});handleClose()}})
  const deleteM=useMutation({mutationFn:(id:number)=>studyPlansService.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['study-plans']})})

  const createSubM=useMutation({mutationFn:()=>planSubjectsService.create(subForm),onSuccess:()=>{qc.invalidateQueries({queryKey:['plan-subjects']});setShowSub(false);setSubForm({})}})
  const deleteSubM=useMutation({mutationFn:(id:number)=>planSubjectsService.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['plan-subjects']})})

  function openAdd(){setEdit(null);setForm({plan_name:'',is_current:false});setShow(true)}
  function openEdit(p:StudyPlan){setEdit(p);setForm({...p});setShow(true)}
  function handleClose(){setShow(false);setEdit(null);setForm({})}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الخطط الدراسية</h1>
        <Button onClick={openAdd}><Plus className="ml-2 h-4 w-4" />إضافة خطة</Button>
      </div>
      <DataTable
        columns={[
          {key:'plan_name',label:'الخطة'},
          {key:'program_name',label:'البرنامج'},
          {key:'start_date',label:'تاريخ البداية'},
          {key:'end_date',label:'تاريخ النهاية'},
          {key:'is_current',label:'الحالية',render:(r:StudyPlan)=>r.is_current?'★ نعم':'—'},
        ]}
        data={plans}
        actions={(r:StudyPlan)=>(
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={()=>{setSelectedPlan(r.id);setShowSub(true);setSubForm({study_plan_id:r.id,study_subject_id:0,study_level_id:0,theory_hours:0,practical_hours:0,lab_hours:0})}}><BookOpen className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={()=>openEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={()=>{if(confirm('حذف الخطة؟'))deleteM.mutate(r.id)}}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />

      {/* Plan Subjects Modal */}
      <Modal isOpen={showSub} onClose={()=>setShowSub(false)} title={selectedPlan?`توزيع المواد على المستويات`:'توزيع المواد'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect label="المادة" value={subForm.study_subject_id as number||0} onChange={(v)=>setSubForm({...subForm,study_subject_id:Number(v)})} placeholder="اختر المادة..." options={(subjects||[]).map(s=>({value:s.id,label:`${s.subject_name}${s.subject_code?` - ${s.subject_code}`:''}`}))} />
            <SearchableSelect label="المستوى" value={subForm.study_level_id as number||0} onChange={(v)=>setSubForm({...subForm,study_level_id:Number(v)})} placeholder="اختر المستوى..." options={(levels||[]).map(l=>({value:l.id,label:l.level_name}))} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Input label="نظري" type="number" value={subForm.theory_hours as string||'0'} onChange={(e)=>setSubForm({...subForm,theory_hours:e.target.value})} />
            <Input label="عملي" type="number" value={subForm.practical_hours as string||'0'} onChange={(e)=>setSubForm({...subForm,practical_hours:e.target.value})} />
            <Input label="مختبر" type="number" value={subForm.lab_hours as string||'0'} onChange={(e)=>setSubForm({...subForm,lab_hours:e.target.value})} />
            <Input label="مشاريع" type="number" value={subForm.project_hours as string||'0'} onChange={(e)=>setSubForm({...subForm,project_hours:e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={subForm.is_required as boolean||false} onChange={(e)=>setSubForm({...subForm,is_required:e.target.checked})} className="rounded" />
            <span className="text-sm">مادة إجبارية</span>
          </div>
          {selectedPlan>0&&planSubjects.length>0&&(
            <div className="border rounded-md divide-y text-sm">
              {planSubjects.map((ps:PlanSubject)=>(
                <div key={ps.id} className="flex items-center justify-between px-3 py-2">
                  <span>{ps.subject_name}{ps.level_name?` (${ps.level_name})`:''} — {ps.theory_hours+ps.practical_hours+ps.lab_hours+ps.project_hours} س</span>
                  <Button variant="ghost" size="sm" onClick={()=>{if(confirm('حذف المادة من الخطة؟'))deleteSubM.mutate(ps.id)}}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={()=>{if(!subForm.study_subject_id||subForm.study_subject_id===0)return;createSubM.mutate()}} isLoading={createSubM.isPending}><Plus className="ml-2 h-4 w-4" />إضافة مادة للخطة</Button>
        </div>
      </Modal>

      <Modal isOpen={show} onClose={handleClose} title={edit?'تعديل خطة':'إضافة خطة'}>
        <div className="space-y-4">
          <SearchableSelect label="البرنامج" value={form.program_id as number||0} onChange={(v)=>setForm({...form,program_id:Number(v)})} placeholder="اختر البرنامج..." options={(programs||[]).map(p=>({value:p.id,label:p.program_name}))} />
          <Input label="اسم الخطة" value={form.plan_name as string||''} onChange={(e)=>setForm({...form,plan_name:e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاريخ البداية" type="date" value={form.start_date as string||''} onChange={(e)=>setForm({...form,start_date:e.target.value})} />
            <Input label="تاريخ النهاية" type="date" value={form.end_date as string||''} onChange={(e)=>setForm({...form,end_date:e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_current as boolean||false} onChange={(e)=>setForm({...form,is_current:e.target.checked})} className="rounded" />
            <span className="text-sm">الخطة الحالية</span>
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
