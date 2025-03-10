import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreatePatientDto {
    @IsString()
    @IsNotEmpty()
    username!: string

    @IsString()
    @IsNotEmpty()
    password!: string

    @IsEmail()
    @IsNotEmpty()
    email!: string

    @IsString()
    role: string = "patient"

    @IsString()
    @IsNotEmpty()
    fullName!: string

    @IsString()
    @IsNotEmpty()
    dateOfBirth!: string

    @IsString()
    @IsNotEmpty()
    gender!: string

    @IsString()
    @IsNotEmpty()
    phone!: string

    @IsString()
    @IsNotEmpty()
    address!: string

    @IsOptional()
    @IsArray()
    medicalHistory?: Array<{ condition: string; diagnosisDate: string; treatment: string }>

    @IsOptional()
    @IsArray()
    appointments?: Array<{ doctorId: string; date: string; time: string; status: string }>

    @IsOptional()
    emergencyContact?: { name: string; relationship: string; phone: string }
}

export class UpdatePatientDto extends CreatePatientDto {}
