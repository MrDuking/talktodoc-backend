import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @ApiProperty({ type: String, description: 'Reference to the patient who booked the appointment' })
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient!: Types.ObjectId;

  @ApiProperty({ type: String, description: 'Speciality selected during appointment creation' })
  @Prop({ type: Types.ObjectId, ref: 'Speciality', required: true })
  specialty!: Types.ObjectId;

  @ApiProperty({
    type: Object,
    description: 'Response data collected from the speciality-specific medical questionnaire',
  })
  @Prop({ type: Object, default: {} })
  answers_data!: Record<string, any>;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Assigned doctor for the appointment',
  })
  @Prop({ type: Types.ObjectId, ref: 'Doctor', default: null })
  doctor?: Types.ObjectId;

  @ApiProperty({
    type: Date,
    required: false,
    description: 'UTC start time of the scheduled appointment slot',
  })
  @Prop({ type: Date, default: null })
  start_time?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description: 'UTC end time of the scheduled appointment slot',
  })
  @Prop({ type: Date, default: null })
  end_time?: Date;

  @ApiProperty({
    enum: ['PAID', 'UNPAID', null],
    required: false,
    description: 'Billing status of the appointment',
  })
  @Prop({ type: String, enum: ['PAID', 'UNPAID', null], default: null })
  billing_status?: 'PAID' | 'UNPAID' | null;

  @ApiProperty({
    enum: ['INIT', 'ANSWERED', 'SELECTED_DOCTOR', 'PAID'],
    default: 'INIT',
    description: 'Current progress stage of the appointment booking flow',
  })
  @Prop({ type: String, enum: ['INIT', 'ANSWERED', 'SELECTED_DOCTOR', 'PAID'], default: 'INIT' })
  status!: 'INIT' | 'ANSWERED' | 'SELECTED_DOCTOR' | 'PAID';
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
