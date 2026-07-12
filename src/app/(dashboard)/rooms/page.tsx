'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { roomsService } from '@/services/rooms.service'
import { buildingsService } from '@/services/buildings.service'
import type { Room } from '@/types'

const ROOM_TYPES = ['theory','lab','workshop','smart']
const ROOM_TYPE_LABELS: Record<string,string> = {theory:'نظرية',lab:'مختبر',workshop:'ورشة',smart:'ذكية'}
export default function RoomsPage() {
  const qc = useQueryClient()
  const [show, setShow] = useState(false); const [edit, setEdit] = useState<Room|null>(null)
  const [form, setForm] = useState<Record<string,unknown>>({}); const [err, setErr] = useState<Record<string,string>>({})
  const {data:rooms=[]} = useQuery({queryKey:['rooms'],queryFn:()=>roomsService.getAll()})
  const {data:buildings} = useQuery({queryKey:['buildings'],queryFn:()=>buildingsService.getAll()})

  const createM=useMutation({mutationFn:()=>roomsService.create(form),onSuccess:()=>{qc.invalidateQueries({queryKey:['rooms']});handleClose()}})
  const updateM=useMutation({mutationFn:()=>roomsService.update(edit!.id,form),onSuccess:()=>{qc.invalidateQueries({queryKey:['rooms']});handleClose()}})
  const deleteM=useMutation({mutationFn:(id:number)=>roomsService.delete(id),onSuccess:()=>qc.invalidateQueries({queryKey:['rooms']})})

  function openAdd(){setEdit(null);setForm({room_name:'',room_type:'theory',capacity:0,is_available:true,latitude:null,longitude:null,radius:50});setErr({});setShow(true)}
  function openEdit(r:Room){setEdit(r);setForm({...r});setErr({});setShow(true)}
  function handleClose(){setShow(false);setEdit(null);setForm({})}
  function validate(){const e:Record<string,string>={};if(!form.room_name)e.room_name='مطلوب';setErr(e);return Object.keys(e).length===0}
  function handleSave(){if(!validate())return;if(edit)updateM.mutate();else createM.mutate()}
  function handleDelete(id:number){if(confirm('حذف القاعة؟'))deleteM.mutate(id)}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">القاعات</h1>
        <Button onClick={openAdd}><Plus className="ml-2 h-4 w-4" />إضافة قاعة</Button>
      </div>
      <DataTable
        columns={[
          {key:'room_name',label:'القاعة'},
          {key:'room_code',label:'الكود'},
          {key:'building_name',label:'المبنى'},
          {key:'room_type',label:'النوع',render:(r:Room)=>ROOM_TYPE_LABELS[r.room_type]||r.room_type},
          {key:'capacity',label:'السعة',render:(r:Room)=>r.capacity},
          {key:'latitude',label:'خط العرض',render:(r:Room)=>r.latitude?.toFixed(6)||'---'},
          {key:'longitude',label:'خط الطول',render:(r:Room)=>r.longitude?.toFixed(6)||'---'},
          {key:'radius',label:'النطاق(م)',render:(r:Room)=>r.radius||50},
          {key:'is_available',label:'الحالة',render:(r:Room)=>r.is_available?'متاحة':'غير متاحة'},
        ]}
        data={rooms}
        actions={(r:Room)=>(
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={()=>openEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={()=>handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Modal isOpen={show} onClose={handleClose} title={edit?'تعديل قاعة':'إضافة قاعة'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم القاعة" value={form.room_name as string||''} onChange={(e)=>setForm({...form,room_name:e.target.value})} error={err.room_name} />
            <Input label="الكود" value={form.room_code as string||''} onChange={(e)=>setForm({...form,room_code:e.target.value})} />
          </div>
          <SearchableSelect label="المبنى" value={form.building_id as number||0} onChange={(v)=>setForm({...form,building_id:Number(v)})} placeholder="اختر المبنى..." options={(buildings||[]).map(b=>({value:b.id,label:b.building_name}))} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">النوع</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.room_type as string||'theory'} onChange={(e)=>setForm({...form,room_type:e.target.value})}>
                {ROOM_TYPES.map(t=><option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <Input label="السعة" type="number" value={form.capacity as string||'0'} onChange={(e)=>setForm({...form,capacity:parseInt(e.target.value)||0})} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="خط العرض (Latitude)" type="number" step="any" value={form.latitude as string||''} onChange={(e)=>setForm({...form,latitude:parseFloat(e.target.value)||null})} />
            <Input label="خط الطول (Longitude)" type="number" step="any" value={form.longitude as string||''} onChange={(e)=>setForm({...form,longitude:parseFloat(e.target.value)||null})} />
            <Input label="نطاق التحقق (متر)" type="number" value={form.radius as string||'50'} onChange={(e)=>setForm({...form,radius:parseInt(e.target.value)||50})} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">ملاحظات</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.notes as string||''} onChange={(e)=>setForm({...form,notes:e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={createM.isPending||updateM.isPending}>{edit?'حفظ':'إضافة'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
