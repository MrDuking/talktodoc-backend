import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmployeeDto {
    @ApiProperty({ example: "duk@example.com", description: "Employee's email" })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: "Duk Nguyen", description: "Full name of the employee" })
    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @ApiProperty({ example: "Manager", description: "Position of the employee" })
    @IsString()
    @IsNotEmpty()
    position!: string;

    @ApiProperty({ example: "HR", description: "Department of the employee" })
    @IsString()
    @IsNotEmpty()
    department?: string;

    @ApiProperty({ example: "2023-05-15", description: "Start date of the employee (YYYY-MM-DD)" })
    @IsDateString()
    @IsNotEmpty()
    startDate?: string;

    @ApiProperty({ example: "094333346", description: "Employee's phone number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

    @ApiProperty({ example: "avatar_url.jpg", description: "Employee's avatar", required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ example: true, description: "Is employee active?", required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ example: 5000, description: "Salary of the employee", required: false })
    @IsOptional()
    @IsNumber()
    salary?: number;

    @ApiProperty({ example: "Full-time", description: "Type of contract", required: false })
    @IsOptional()
    @IsString()
    contractType?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
