import { Prop } from '@nestjs/mongoose'

export abstract class BaseUser {
  @Prop({ required: true, unique: true })
  username!: string

  @Prop({ required: true, select: false })
  password!: string

  @Prop({ required: true, unique: true })
  email!: string

  @Prop()
  fullName!: string

  @Prop({ required: true })
  phoneNumber!: string

  @Prop({ type: Date })
  birthDate!: Date

  @Prop({ default: true })
  isActive!: boolean

  @Prop()
  avatarUrl?: string

  @Prop({
    type: Object,
    default: null,
  })
  city?: {
    name: string
    code: number
    division_type: string
    codename: string
    phone_code: number
    districts?: any[]
  }
}
