import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsArray, IsBoolean, IsOptional } from "class-validator";

export class CreatePharmacyDto {
    @ApiProperty({ example: "Green Pharmacy", description: "Name of the pharmacy" })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: "123 Main St, City", description: "Address of the pharmacy" })
    @IsString()
    @IsNotEmpty()
    address!: string;

    @ApiProperty({ example: "0987654321", description: "Contact number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

    @ApiProperty({ example: ["Paracetamol", "Ibuprofen"], description: "List of available medicines", required: false })
    @IsArray()
    availableMedicines?: string[];

    @ApiProperty({ example: true, description: "Is pharmacy active?", required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdatePharmacyDto extends PartialType(CreatePharmacyDto) {}
