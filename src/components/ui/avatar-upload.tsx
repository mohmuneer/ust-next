'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface AvatarUploadProps {
  currentImage?: string | null
  onImageChange: (filename: string | null) => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function AvatarUpload({ currentImage, onImageChange, size = 'lg', label }: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage ? getImageUrl(currentImage) : null)
  const [error, setError] = useState('')

  const sizeClasses = size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-24 h-24' : 'w-32 h-32'
  const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      setError('يرجى اختيار صورة (JPEG, PNG, WebP, GIF)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة يجب أن لا يتجاوز 2MB')
      return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', 'avatar')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const result = await res.json()
      if (result.filename) {
        onImageChange(result.filename)
        setPreview(getImageUrl(result.filename))
      } else {
        throw new Error('فشل الرفع')
      }
    } catch {
      setError('فشل رفع الصورة')
      setPreview(currentImage ? getImageUrl(currentImage) : null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <div
          className={`${sizeClasses} rounded-full overflow-hidden border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative group`}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className={`${iconSize} animate-spin text-muted-foreground`} />
          ) : preview ? (
            <>
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className={`${iconSize} text-white`} />
              </div>
            </>
          ) : (
            <Camera className={`${iconSize} text-muted-foreground`} />
          )}
        </div>
        {preview && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleRemove() }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center shadow-sm hover:bg-danger/90 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
