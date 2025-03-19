import { ApiProperty, PartialType } from "@nestjs/swagger"
import { IsArray, IsBoolean, IsNotEmpty, IsString } from "class-validator"

export class CreatePharmacyDto {
    @ApiProperty({ example: "Green Pharmacy", description: "Name of the pharmacy" })
    @IsString()
    @IsNotEmpty()
    name!: string

    @ApiProperty({ example: "123 Main St, City", description: "Address of the pharmacy" })
    @IsString()
    @IsNotEmpty()
    address!: string

    @ApiProperty({ example: "123 Main St, City", description: "Address of the pharmacy" })
    @IsString()
    @IsNotEmpty()
    city!: string

    @ApiProperty({ example: "0987654321", description: "Contact number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string

    @ApiProperty({ example: ["Paracetamol", "Ibuprofen"], description: "List of available medicines", required: false })
    @IsArray()
    availableMedicines?: string[]

    @ApiProperty({ example: true, description: "Is the active the pharmacy?", required: false })
    @IsBoolean()
    active?: boolean

    @ApiProperty({ example: true, description: "Is the pharmacy open 24 hours?", required: false })
    @IsBoolean()
    is24Hours?: boolean
}

export class UpdatePharmacyDto extends PartialType(CreatePharmacyDto) {}
