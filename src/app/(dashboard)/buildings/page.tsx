'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { buildingsService } from '@/services/buildings.service'
import { collegesService } from '@/services/colleges.service'
import type { Building } from '@/types'

export default function BuildingsPage() {
  const qc = useQueryClient()
  const [show, setShow] = useState(false); const [edit, setEdit] = useState<Building|null>(null)
  const [form, setForm] = useState<Record<string,unknown>>({}); const [err, setErr] = useState<Record<string,string>>({})
  const {data:buildings=[]} = useQuery({queryKey:['buildings'],queryFn:()=>buildingsService.getAll()})
  const {data:colleges} = useQuery({queryKey:['colleges'],queryFn:()=>collegesService.getAll()})

  const createM=useMutation({mutationFn:()=>buildingsService.create(form),onSuccess:()=>{qc.invalidateQueries({queryKey:['buildings']});handleClose()}})
  const updateM=useMutation({mutationFn:()=>buildingsService.update(edit!.id,form),onSuccess:()=>{qc.invalidateQueries({queryKey:['buildings']});handleClose()}})
  const deleteM=useMutation({mutationFn:(id:number)=>buildingsService.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['buildings']})})

  function openAdd(){setEdit(null);setForm({building_name:'',building_code:''});setErr({});setShow(true)}
  function openEdit(b:Building){setEdit(b);setForm({...b});setErr({});setShow(true)}
  function handleClose(){setShow(false);setEdit(null);setForm({})}
  function validate(){const e:Record<string,string>={};if(!form.building_name)e.building_name='مطلوب';setErr(e);return Object.keys(e).length===0}
  function handleSave(){if(!validate())return;if(edit)updateM.mutate();else createM.mutate()}
  function handleDelete(id:number){if(confirm('حذف المبنى؟'))deleteM.mutate(id)}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المباني</h1>
        <Button onClick={openAdd}><Plus className="ml-2 h-4 w-4" />إضافة مبنى</Button>
      </div>
      <DataTable
        columns={[
          {key:'building_name',label:'اسم المبنى'},
          {key:'building_code',label:'الكود'},
          {key:'college_name',label:'الكلية'},
        ]}
        data={buildings}
        actions={(r:Building)=>(
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={()=>openEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={()=>handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Modal isOpen={show} onClose={handleClose} title={edit?'تعديل مبنى':'إضافة مبنى'}>
        <div className="space-y-4">
          <Input label="اسم المبنى" value={form.building_name as string||''} onChange={(e)=>setForm({...form,building_name:e.target.value})} error={err.building_name} />
          <Input label="الكود" value={form.building_code as string||''} onChange={(e)=>setForm({...form,building_code:e.target.value})} />
          <SearchableSelect label="الكلية" value={form.college_id as number||0} onChange={(v)=>setForm({...form,college_id:Number(v)})} placeholder="اختر الكلية..." options={(colleges||[]).map(c=>({value:c.id,label:c.college_name}))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={createM.isPending||updateM.isPending}>{edit?'حفظ':'إضافة'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
