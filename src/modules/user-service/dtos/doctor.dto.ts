import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateDoctorDto {
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
    role: string = "doctor"

    @IsString()
    @IsNotEmpty()
    fullName!: string

    @IsString()
    @IsNotEmpty()
    specialty!: string[]

    @IsString()
    @IsNotEmpty()
    hospitalId!: string

    @IsNumber()
    experienceYears!: number

    @IsString()
    licenseNo!: string

    @IsArray()
    availability!: Array<{ date: string; timeSlots: string[] }>

    @IsString()
    rank!: string
}

export class UpdateDoctorDto {
    @IsOptional()
    @IsString()
    fullName?: string

    @IsOptional()
    @IsString()
    specialty?: string[]

    @IsOptional()
    @IsString()
    hospitalId?: string

    @IsOptional()
    @IsNumber()
    experienceYears?: number

    @IsOptional()
    @IsString()
    licenseNo?: string

    @IsOptional()
    @IsArray()
    availability?: Array<{ date: string; timeSlots: string[] }>

    @IsOptional()
    @IsString()
    rank?: string
}
