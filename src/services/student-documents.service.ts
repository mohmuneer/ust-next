import { studentApi } from './student-api'

export const studentDocumentsService = {
  getDocuments(params?: { category_id?: number }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/documents${q}`)
  },
  getCategories() {
    return studentApi.get<any[]>('/document-categories')
  },
}
