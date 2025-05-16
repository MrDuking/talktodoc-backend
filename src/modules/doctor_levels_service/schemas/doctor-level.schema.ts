import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Model } from 'mongoose'

export type DoctorLevelDocument = DoctorLevel & Document
export type DoctorLevelModel = Model<DoctorLevelDocument>

@Schema({ timestamps: true })
export class DoctorLevel {
  @Prop({ unique: true })
  id!: string

  @Prop({ required: true })
  name!: string

  @Prop()
  description?: string

  @Prop({ required: true })
  base_price!: number

  @Prop({ default: true })
  isActive!: boolean
}

export const DoctorLevelSchema = SchemaFactory.createForClass(DoctorLevel)

DoctorLevelSchema.pre<DoctorLevelDocument>('save', async function (next) {
  if (!this.id) {
    let uniqueId
    let isUnique = false
    const DoctorLevelModel = this.constructor as DoctorLevelModel

    while (!isUnique) {
      uniqueId = `DL${Math.floor(100000 + Math.random() * 900000)}`
      const existing = await DoctorLevelModel.findOne({ id: uniqueId }).exec()
      if (!existing) {
        isUnique = true
      }
    }

    this.id = uniqueId
  }
  next()
})
