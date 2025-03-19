import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Speciality } from "../../speciality_service/schemas/speciality.schema";

export class CreateDoctorDto {
    @ApiProperty({ description: "Doctor's name" })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ description: "Doctor's email" })
    @IsNotEmpty()
    @IsString()
    email!: string;

    @ApiProperty({ type: [Speciality], description: "List of specialties" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Speciality)
    specialties!: Speciality[];
}

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {}
