'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  icon?: 'delete' | 'warning'
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' })
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolveRef?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolveRef?.(false)
  }

  const modal = (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={options.title || 'تأكيد العملية'}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleCancel}>
            {options.cancelText || 'إلغاء'}
          </Button>
          <Button
            variant={options.variant === 'danger' ? 'danger' : 'default'}
            onClick={handleConfirm}
          >
            {options.confirmText || 'تأكيد'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className={`p-3 rounded-full mb-4 ${options.variant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
          {options.icon === 'delete' ? (
            <Trash2 className="h-8 w-8" />
          ) : (
            <AlertTriangle className="h-8 w-8" />
          )}
        </div>
        <p className="text-foreground">{options.message}</p>
      </div>
    </Modal>
  )

  return { confirm, modal }
}
