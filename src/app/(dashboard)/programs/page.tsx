'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { programsService } from '@/services/programs.service'
import { departmentsService } from '@/services/departments.service'
import type { Program } from '@/types'

export default function ProgramsPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: programs = [] } = useQuery({ queryKey: ['programs'], queryFn: () => programsService.getAll() })
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsService.getAll() })

  const createMut = useMutation({
    mutationFn: () => programsService.create(form),
    onSuccess: () => { queryClient.invalidateQueries({queryKey:['programs']}); handleClose() },
  })
  const updateMut = useMutation({
    mutationFn: () => programsService.update(editing!.id, form),
    onSuccess: () => { queryClient.invalidateQueries({queryKey:['programs']}); handleClose() },
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => programsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({queryKey:['programs']}),
  })

  function openAdd() { setEditing(null); setForm({program_name:'',status:'active'}); setErrors({}); setShowModal(true) }
  function openEdit(p: Program) { setEditing(p); setForm({...p}); setErrors({}); setShowModal(true) }
  function handleClose() { setShowModal(false); setEditing(null); setForm({}) }
  function validate() {
    const errs: Record<string, string> = {}
    if (!form.program_name) errs.program_name = 'مطلوب'
    setErrors(errs); return Object.keys(errs).length === 0
  }
  function handleSave() { if (!validate()) return; if (editing) updateMut.mutate(); else createMut.mutate() }
  function handleDelete(id: number) { if (confirm('حذف البرنامج؟')) deleteMut.mutate(id) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">البرامج</h1>
        <Button onClick={openAdd}><Plus className="ml-2 h-4 w-4" />إضافة برنامج</Button>
      </div>
      <DataTable
        columns={[
          {key:'program_name', label:'البرنامج'},
          {key:'program_name_en', label:'الاسم الإنجليزي'},
          {key:'department_name', label:'القسم'},
          {key:'total_hours', label:'الساعات', render:(r:Program)=>r.total_hours?`${r.total_hours} س`: '—'},
          {key:'total_levels', label:'المستويات', render:(r:Program)=>r.total_levels??'—'},
          {key:'status', label:'الحالة'},
        ]}
        data={programs}
        actions={(r:Program)=>(
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={()=>openEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={()=>handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Modal isOpen={showModal} onClose={handleClose} title={editing?'تعديل برنامج':'إضافة برنامج'}>
        <div className="space-y-4">
          <Input label="اسم البرنامج" value={form.program_name as string||''} onChange={(e)=>setForm({...form,program_name:e.target.value})} error={errors.program_name} />
          <Input label="الاسم الإنجليزي" value={form.program_name_en as string||''} onChange={(e)=>setForm({...form,program_name_en:e.target.value})} />
          <SearchableSelect label="القسم" value={form.department_id as number||0} onChange={(v)=>setForm({...form,department_id:Number(v)})} placeholder="اختر القسم..." options={(departments||[]).map(d=>({value:d.id,label:d.department_name}))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="عدد الساعات" type="number" value={form.total_hours as string||''} onChange={(e)=>setForm({...form,total_hours:e.target.value})} />
            <Input label="عدد المستويات" type="number" value={form.total_levels as string||''} onChange={(e)=>setForm({...form,total_levels:e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={createMut.isPending||updateMut.isPending}>{editing?'حفظ':'إضافة'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
