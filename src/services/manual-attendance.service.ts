import { sessionStudentsService } from './session-students.service'
export type { SessionStudent } from './session-students.service'

export const manualAttendanceService = {
  getSessionStudents: sessionStudentsService.getBySession,
  submit: sessionStudentsService.submitManualAttendance,
}
