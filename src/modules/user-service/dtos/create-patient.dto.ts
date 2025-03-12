import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "@common/enum/user_role.enum";

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

    // @ApiProperty({ example: UserRole.PATIENT, description: "Role of the patient", default: UserRole.PATIENT })
    // @IsString()
    // role: UserRole = UserRole.PATIENT;

    @ApiProperty({ example: "Duk Nguyen", description: "Full name of the patient" })
    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @ApiProperty({ example: "1995-07-20", description: "Patient's birth date" })
    @IsString()
    @IsNotEmpty()
    birthDate!: string;

    @ApiProperty({ example: "Male", description: "Patient's gender" })
    @IsString()
    @IsNotEmpty()
    gender!: string;

    @ApiProperty({ example: "0987123456", description: "Patient's phone number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

    @ApiProperty({ example: "123 Main St, City, Country", description: "Patient's address" })
    @IsString()
    @IsNotEmpty()
    address!: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
