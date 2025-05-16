export interface JwtPayload {
  userId: string
  username: string
  role: 'PATIENT' | 'DOCTOR' | 'EMPLOYEE' | 'ADMIN'
}
