import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { BaseUser } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";
import { Speciality } from "@modules/speciality_service/schemas/speciality.schema";

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor extends BaseUser {
    @Prop({ required: true, unique: true, default: () => `DR-${Math.floor(100000 + Math.random() * 900000)}` })
    id!: string;

    @Prop({ default: UserRole.DOCTOR })
    role!: UserRole;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Speciality" }] }) // ✅ Đúng
    specialty!: Types.ObjectId[] | Speciality[];
    
    @Prop({ required: true })
    hospitalId!: string;

    @Prop({ default: 0 })
    experienceYears!: number;

    @Prop()
    licenseNo!: string;

    @Prop({ type: [{ date: { type: String }, timeSlots: { type: [String] } }] })
    availability!: Array<{ date: string; timeSlots: string[] }>;

    @Prop()
    rank!: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

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