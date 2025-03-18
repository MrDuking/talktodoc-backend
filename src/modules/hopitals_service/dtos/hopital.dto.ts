import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateHospitalDto {
    @ApiProperty({ example: "General Hospital", description: "Hospital name" })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: "123 Main Street, City", description: "Hospital address" })
    @IsString()
    @IsNotEmpty()
    address!: string;

    @ApiProperty({ example: "+1234567890", description: "Hospital phone number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

    @ApiProperty({ example: ["Cardiology", "Neurology"], description: "Hospital departments", required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    departments?: string[];

    @ApiProperty({ example: true, description: "Is hospital government-owned?", required: false })
    @IsOptional()
    @IsBoolean()
    isGovernmentOwned?: boolean;
}

export class UpdateHospitalDto extends PartialType(CreateHospitalDto) {}
