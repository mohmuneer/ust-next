import { studentApi } from './student-api'

export const studentGradesService = {
  getAcademicRecords(studentId: number) {
    return studentApi.get<any[]>(`/academic-records?student_id=${studentId}`)
  },
  getSemesterGpa(studentId: number) {
    return studentApi.get<any[]>(`/student-semester-gpa?student_id=${studentId}`)
  },
  getExamGrades(studentId: number) {
    return studentApi.get<any[]>(`/exam-grades?student_id=${studentId}`)
  },
}
