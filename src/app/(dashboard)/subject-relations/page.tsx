'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Trash2 } from 'lucide-react'
import { subjectRelationsService } from '@/services/subject-relations.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import type { SubjectRelation } from '@/types'

export default function SubjectRelationsPage() {
  const qc = useQueryClient()
  const [show, setShow]=useState(false); const [form, setForm]=useState<Record<string,unknown>>({study_subject_id:0,related_subject_id:0,relation_type:'prerequisite'})
  const [err, setErr]=useState<Record<string,string>>({})
  const {data:relations=[]}=useQuery({queryKey:['subject-relations'],queryFn:()=>subjectRelationsService.getAll()})
  const {data:subjects}=useQuery({queryKey:['study-subjects'],queryFn:()=>studySubjectsService.getAll()})

  const createM=useMutation({mutationFn:()=>subjectRelationsService.create(form),onSuccess:()=>{qc.invalidateQueries({queryKey:['subject-relations']});setShow(false);setForm({study_subject_id:0,related_subject_id:0,relation_type:'prerequisite'})}})
  const deleteM=useMutation({mutationFn:(id:number)=>subjectRelationsService.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['subject-relations']})})

  function validate(){const e:Record<string,string>={};if(!form.study_subject_id||form.study_subject_id===0)e.study_subject_id='مطلوب';if(!form.related_subject_id||form.related_subject_id===0)e.related_subject_id='مطلوب';if(form.study_subject_id===form.related_subject_id)e.related_subject_id='لا يمكن ربط المادة بنفسها';setErr(e);return Object.keys(e).length===0}
  function handleSave(){if(!validate())return;createM.mutate()}
  function handleDelete(id:number){if(confirm('حذف العلاقة؟'))deleteM.mutate(id)}

  const opts=(subjects||[]).map(s=>({value:s.id,label:`${s.subject_name}${s.subject_code?` - ${s.subject_code}`:''}`}))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المتطلبات السابقة</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة المتطلبات السابقة والمتزامنة للمواد</p>
        </div>
        <Button onClick={()=>{setForm({study_subject_id:0,related_subject_id:0,relation_type:'prerequisite'});setErr({});setShow(true)}}><Plus className="ml-2 h-4 w-4" />إضافة علاقة</Button>
      </div>
      <DataTable
        columns={[
          {key:'subject_name',label:'المادة'},
          {key:'relation_type',label:'النوع',render:(r:SubjectRelation)=>r.relation_type==='prerequisite'?'متطلب سابق':'متطلب متزامن'},
          {key:'related_name',label:'المادة المرتبطة'},
        ]}
        data={relations}
        actions={(r:SubjectRelation)=>(
          <Button variant="ghost" size="sm" onClick={()=>handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        )}
      />
      <Modal isOpen={show} onClose={()=>setShow(false)} title="إضافة علاقة">
        <div className="space-y-4">
          <SearchableSelect label="المادة" value={form.study_subject_id as number||0} onChange={(v)=>setForm({...form,study_subject_id:Number(v)})} placeholder="اختر المادة..." options={opts} />
          {err.study_subject_id&&<p className="text-xs text-destructive">{err.study_subject_id}</p>}
          <SearchableSelect label="المادة المرتبطة" value={form.related_subject_id as number||0} onChange={(v)=>setForm({...form,related_subject_id:Number(v)})} placeholder="اختر المادة المرتبطة..." options={opts} />
          {err.related_subject_id&&<p className="text-xs text-destructive">{err.related_subject_id}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium">نوع العلاقة</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.relation_type as string} onChange={(e)=>setForm({...form,relation_type:e.target.value})}>
              <option value="prerequisite">متطلب سابق</option>
              <option value="corequisite">متطلب متزامن</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={()=>setShow(false)}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={createM.isPending}>إضافة</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
