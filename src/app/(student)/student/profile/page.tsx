'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Award, Hash, BookCopy, GraduationCap, Save, Camera, Lock } from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { AvatarUpload } from '@/components/ui/avatar-upload'

export default function ProfilePage() {
  const { student } = useStudentAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    phone: student?.phone || '',
    address: student?.address || '',
    email: student?.email || '',
    photo: student?.photo || '',
  })

  useEffect(() => {
    if (student) {
      setForm((prev) => ({
        phone: student.phone ?? prev.phone,
        address: student.address ?? prev.address,
        email: student.email ?? prev.email,
        photo: student.photo ?? prev.photo,
      }))
    }
  }, [student?.phone, student?.address, student?.email, student?.photo])

  if (!student) return null

  const handleSave = async () => {
    try {
      const payload: Record<string, unknown> = { phone: form.phone, address: form.address, email: form.email }
      if (form.photo) payload.photo = form.photo
      await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setEditing(false)
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
          <p className="text-gray-500 text-sm">عرض وتعديل بياناتك الشخصية</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          <Save className="h-4 w-4" />
          {editing ? 'حفظ التغييرات' : 'تعديل البيانات'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 mb-6">
            <div className="relative">
              <AvatarUpload
                currentImage={student.photo}
                onImageChange={(filename) => setForm({ ...form, photo: filename || '' })}
                size="md"
              />
            </div>
          <div className="text-center sm:text-right">
            <h2 className="text-xl font-bold">{student.full_name}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1.5 justify-center sm:justify-start mt-1">
              <Hash className="h-3.5 w-3.5" />
              {student.student_number}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الاسم الكامل</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium">{student.full_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الرقم الجامعي</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium">{student.student_number}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">البريد الإلكتروني</label>
            {editing ? (
              <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            ) : (
              <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {student.email || '---'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">رقم الهاتف</label>
            {editing ? (
              <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            ) : (
              <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                {student.phone || '---'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الكلية</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium flex items-center gap-2">
              <BookCopy className="h-4 w-4 text-gray-400" />
              {student.college_name || '---'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">القسم</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium">{student.department_name || '---'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">المستوى الدراسي</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              {student.level_name || '---'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">المجموعة</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium">{student.group_name || '---'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الترم الدراسي</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium">{student.semester_name || '---'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الحالة الأكاديمية</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-400" />
              {student.academic_status === 'active' ? 'نشط' : student.academic_status || '---'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">المعدل التراكمي</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-bold">{student.cumulative_gpa ? parseFloat(student.cumulative_gpa).toFixed(3) : '---'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الساعات المكتسبة</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-bold">{student.total_earned_hours ?? '---'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ الالتحاق</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              {student.enrollment_date || '---'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الجنسية</label>
            <div className="p-3 rounded-xl bg-gray-50 text-sm font-medium">{student.nationality || '---'}</div>
          </div>
          {editing && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">العنوان</label>
              <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" rows={2} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
