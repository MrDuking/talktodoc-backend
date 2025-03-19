import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";
import { BaseUser } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";
import { Speciality } from "@modules/speciality_service/schemas/speciality.schema";

export type DoctorDocument = Doctor & Document;
export type DoctorModel = Model<DoctorDocument>;

@Schema()
class Availability {
    @Prop({ required: true })
    date!: string;

    @Prop({ type: [String], required: true })
    timeSlots!: string[];
}

@Schema({ timestamps: true })
export class Doctor extends BaseUser {
    @Prop({ unique: true })
    id!: string;

    @Prop({ default: UserRole.DOCTOR })
    role!: UserRole;

    @Prop({ type: [String], required: true, ref: "Speciality" })
    specialty!: string[];

    @Prop({ required: true })
    hospitalId!: string;

    @Prop({ default: 0 })
    experienceYears!: number;

    @Prop()
    licenseNo!: string;

    @Prop({ type: [Availability], default: [] })
    availability!: Availability[];

    @Prop({ type: String, required: true, ref: "DoctorLevel" })
    rank!: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.pre<DoctorDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId;
        let isUnique = false;
        const DoctorModel = this.constructor as DoctorModel;

        while (!isUnique) {
            uniqueId = `DR${Math.floor(100000 + Math.random() * 900000)}`;
            const existing = await DoctorModel.findOne({ id: uniqueId });
            if (!existing) {
                isUnique = true;
            }
        }

        this.id = uniqueId;
    }
    next();
});

// Hàm tạo ID theo định dạng DR-xxxxxx (6 chữ số)
const generateDoctorID = (): string => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // Random số từ 100000 đến 999999
    return `DR-${randomNumber}`;
};

// Middleware: Gán ID trước khi lưu vào database
DoctorSchema.pre<DoctorDocument>("save", async function (next) {
    if (!this.id) {
        let newId;
        let isUnique = false;

        // Kiểm tra ID có trùng lặp trong database không
        while (!isUnique) {
            newId = generateDoctorID();
            const existingDoctor = await this.model("Doctor").findOne({ id: newId });
            if (!existingDoctor) {
                isUnique = true;
            }
        }

        this.id = newId;
    }
    next();
});