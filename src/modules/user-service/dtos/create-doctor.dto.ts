import { ApiProperty, PartialType } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { Types } from "mongoose"

class AvailabilityDto {
    @ApiProperty({ example: "2025-03-20", description: "Date of availability (YYYY-MM-DD)" })
    @IsDateString()
    @IsNotEmpty()
    date!: string

    @ApiProperty({ example: ["08:00-09:00", "10:00-11:00"], description: "Available time slots" })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    timeSlots!: string[]
}

export class CreateDoctorDto {
    @ApiProperty({ example: "duk", description: "Username for the doctor" })
    @IsString()
    @IsNotEmpty()
    username!: string

    @ApiProperty({ example: "password123", description: "Password for the doctor" })
    @IsString()
    @IsNotEmpty()
    password!: string

    @ApiProperty({ example: "duk@example.com", description: "Doctor's email" })
    @IsEmail()
    @IsNotEmpty()
    email!: string

    @ApiProperty({ example: "Dr. Duk Nguyen", description: "Full name of the doctor" })
    @IsString()
    @IsNotEmpty()
    fullName!: string

    @ApiProperty({ example: "1995-07-20", description: "Doctor's birth date (YYYY-MM-DD)" })
    @IsDateString()
    @IsNotEmpty()
    birthDate!: string

    @ApiProperty({ example: "0987123456", description: "Doctor's phone number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string

    @ApiProperty({ example: "avatar_url.jpg", description: "Doctor's avatar", required: false })
    @IsOptional()
    @IsString()
    avatarUrl?: string

    @ApiProperty({ example: true, description: "Is doctor active?", required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean

    @ApiProperty({
        example: { name: "Hanoi", code: 1, division_type: "City", codename: "hanoi", phone_code: 24 },
        description: "City where doctor is located",
        required: false
    })
    @IsOptional()
    city?: {
        name: string
        code: number
        division_type: string
        codename: string
        phone_code: number
    }

    @ApiProperty({ example: ["605c72c3fc13ae1b3c000002"], description: "List of specialty IDs" })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    specialty!: Types.ObjectId[]

    @ApiProperty({ example: "605c72c3fc13ae1b3c000002", description: "Hospital" })
    @IsString()
    @IsNotEmpty()
    hospital!: string

    @ApiProperty({ example: 10, description: "Years of experience in the medical field" })
    @IsNumber()
    @IsOptional()
    experienceYears?: number

    @ApiProperty({ example: "MD123456", description: "Doctor's license number" })
    @IsString()
    @IsNotEmpty()
    licenseNo!: string

    @ApiProperty({ type: [AvailabilityDto], description: "Doctor's availability schedule" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AvailabilityDto)
    @IsOptional()
    availability?: AvailabilityDto[]

    @ApiProperty({ example: "605c72c3fc13ae1b3c000002", description: "Doctor's rank or title" })
    @IsString()
    @IsOptional()
    rank?: string
}

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {}
