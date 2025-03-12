import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseUser, BaseUserSchema } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";

export type EmployeeDocument = Employee & Document;

@Schema()
export class Employee extends BaseUser {
    @Prop({ required: true })
    position!: string;

    @Prop({ required: true })
    department!: string;

    @Prop({ required: true })
    startDate!: string;

    @Prop({ type: Number })
    salary?: number;

    @Prop()
    contractType?: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
export const EmployeeModel = BaseUserSchema.discriminator(UserRole.EMPLOYEE, EmployeeSchema);
