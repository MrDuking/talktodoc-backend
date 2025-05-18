import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Model } from 'mongoose'

export type SpecialtyDocument = Specialty & Document
export type SpecialtyModel = Model<SpecialtyDocument>

@Schema({ timestamps: true })
export class Specialty {
  @Prop({ unique: true })
  id!: string

  @Prop({ required: true })
  name!: string

  @Prop()
  description?: string

  @Prop({ default: true })
  isActive!: boolean

  @Prop({ type: Map, of: String, default: {} })
  config?: Record<string, any>

  @Prop({ type: String, default: '' })
  avatarUrl?: string
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty)
SpecialtySchema.pre<SpecialtyDocument>('save', async function (next) {
  if (!this.id) {
    let uniqueId
    let isUnique = false
    const SpecialtyModel = this.constructor as SpecialtyModel

    while (!isUnique) {
      uniqueId = `SP${Math.floor(100000 + Math.random() * 900000)}`
      const existing = await SpecialtyModel.findOne({ id: uniqueId })
      if (!existing) {
        isUnique = true
      }
    }

    this.id = uniqueId
  }
  next()
})
