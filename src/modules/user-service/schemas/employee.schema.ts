import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseUser } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";
import { nanoid } from "nanoid";

export type EmployeeDocument = Employee & Document;

@Schema()
export class Employee extends BaseUser {
    @Prop({ required: true, unique: true, default: () => `EM${nanoid(6)}` })
    id!: string;

    @Prop({ default: UserRole.EMPLOYEE })
    role!: UserRole;

    @Prop({ required: true })
    position!: string;

    @Prop({ required: true })
    department!: string;

    @Prop({ required: true })
    startDate!: string;

    @Prop()
    salary?: number;

    @Prop()
    contractType?: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
