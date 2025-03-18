import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from "class-validator";

export class CreateDoctorLevelDto {
    @ApiProperty({ example: "General", description: "Doctor level name" })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: "General practitioners", description: "Description", required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 100, description: "Base consultation fee" })
    @IsNumber()
    base_price!: number;

    @ApiProperty({ example: true, description: "Status of doctor level" })
    @IsBoolean()
    isActive!: boolean;
}

export class UpdateDoctorLevelDto extends PartialType(CreateDoctorLevelDto) {}
