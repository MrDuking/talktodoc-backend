import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { UserRole } from "@common/enum/user_role.enum";

export class CreateDoctorDto {
    @ApiProperty({ example: "duk", description: "Username for the doctor" })
    @IsString()
    @IsNotEmpty()
    username!: string;

    @ApiProperty({ example: "password123", description: "Password for the doctor" })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({ example: "duk@example.com", description: "Doctor's email" })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    // @ApiProperty({ example: UserRole.DOCTOR, description: "Role of the doctor", default: UserRole.DOCTOR })
    // @IsString()
    // role: UserRole = UserRole.DOCTOR;

    @ApiProperty({ example: "Dr. Duk Nguyen", description: "Full name of the doctor" })
    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @ApiProperty({ example: "1995-07-20", description: "Doctor's birth date" })
    @IsString()
    @IsNotEmpty()
    birthDate!: string;

    @ApiProperty({ example: ["Cardiology"], description: "Doctor's specialties" })
    @IsArray()
    @IsString({ each: true }) // Đảm bảo mỗi phần tử trong mảng là string
    @IsNotEmpty()
    specialty!: string[];

    @ApiProperty({ example: "65fdc6a2b3e8a8f4b1b2c3d4", description: "Hospital ID where the doctor works" })
    @IsString()
    @IsNotEmpty()
    hospitalId!: string;

    @ApiProperty({ example: "0987123456", description: "Doctor's phone number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

    @ApiProperty({ example: 10, description: "Years of experience in the medical field" })
    @IsNumber()
    experienceYears!: number;

    @ApiProperty({ example: "MED123456", description: "Doctor's license number" })
    @IsString()
    licenseNo!: string;

    @ApiProperty({
        example: [{ date: "2025-03-11", timeSlots: ["09:00-11:00", "14:00-16:00"] }],
        description: "Doctor's availability schedule"
    })
    @IsArray()
    availability!: Array<{ date: string; timeSlots: string[] }>;

    @ApiProperty({ example: "Senior Doctor", description: "Doctor's rank or title" })
    @IsString()
    rank!: string;
}

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {}
