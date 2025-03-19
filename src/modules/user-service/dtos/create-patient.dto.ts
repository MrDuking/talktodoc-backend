import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserRole } from "@common/enum/user_role.enum";

enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
}

class MedicalHistoryDto {
    @ApiProperty({ example: "Diabetes", description: "Medical condition" })
    @IsString()
    @IsNotEmpty()
    condition!: string;

    @ApiProperty({ example: "2022-01-15", description: "Date of diagnosis" })
    @IsDateString()
    @IsNotEmpty()
    diagnosisDate!: string;

    @ApiProperty({ example: "Insulin therapy", description: "Treatment plan" })
    @IsString()
    @IsNotEmpty()
    treatment!: string;
}

class AppointmentDto {
    @ApiProperty({ example: "DR123456", description: "Doctor ID" })
    @IsString()
    @IsNotEmpty()
    doctorId!: string;

    @ApiProperty({ example: "2025-04-10", description: "Appointment date" })
    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ example: "confirmed", description: "Appointment status" })
    @IsString()
    @IsOptional()
    status?: string;
}

class EmergencyContactDto {
    @ApiProperty({ example: "John Doe", description: "Emergency contact name" })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: "Father", description: "Relationship" })
    @IsString()
    @IsNotEmpty()
    relationship!: string;

    @ApiProperty({ example: "0987654321", description: "Emergency contact phone number" })
    @IsString()
    @Matches(/^[0-9]{10,11}$/, { message: "Phone number must be 10-11 digits long" })
    phoneNumber!: string;
}

export class CreatePatientDto {
    @ApiProperty({ example: "duk", description: "Username for the patient" })
    @IsString()
    @IsNotEmpty()
    username!: string;

    @ApiProperty({ example: "password123", description: "Password for the patient" })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({ example: "duk@example.com", description: "Patient's email" })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: "Duk Nguyen", description: "Full name of the patient" })
    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @ApiProperty({ example: "1995-07-20", description: "Patient's birth date (YYYY-MM-DD)" })
    @IsDateString()
    @IsNotEmpty()
    birthDate!: string;

    @ApiProperty({ example: "male", description: "Patient's gender (male, female, other)" })
    @IsEnum(Gender)
    @IsNotEmpty()
    gender!: Gender;

    @ApiProperty({ example: "0987123456", description: "Patient's phone number (10-11 digits)" })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9]{10,11}$/, { message: "Phone number must be 10-11 digits long" })
    phoneNumber!: string;

    @ApiProperty({
        example: { name: "Hanoi", code: 1, division_type: "City", codename: "hanoi", phone_code: 24 },
        description: "City where patient is located",
        required: false,
    })
    @IsOptional()
    city?: {
        name: string;
        code: number;
        division_type: string;
        codename: string;
        phone_code: number;
    };

    @ApiProperty({ example: "true", description: "Account active status" })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;

    @ApiProperty({ example: "https://example.com/avatar.jpg", description: "Patient's avatar URL" })
    @IsString()
    @IsOptional()
    avatar?: string;


    @ApiProperty({ type: [MedicalHistoryDto], description: "Medical history records" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MedicalHistoryDto)
    @IsOptional()
    medicalHistory?: MedicalHistoryDto[] = [];

    @ApiProperty({ type: [AppointmentDto], description: "Appointment records" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AppointmentDto)
    @IsOptional()
    appointments?: AppointmentDto[] = [];
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
