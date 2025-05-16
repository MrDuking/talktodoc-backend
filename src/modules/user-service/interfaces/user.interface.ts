import { UserRole } from '../../auth/enums/user-role.enum'

export interface IUserWithRole {
  _id: any
  name?: string
  fullName?: string
  email?: string
  phoneNumber?: string
  role: UserRole
  [key: string]: any
}
