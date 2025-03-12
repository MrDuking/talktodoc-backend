import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";
import { UserRole } from "@common/enum/user_role.enum";

export class CreateEmployeeDto {
    @ApiProperty({ example: "duk_employee", description: "Username for the employee" })
    @IsString()
    @IsNotEmpty()
    username!: string;

    @ApiProperty({ example: "password123", description: "Password for the employee" })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({ example: "duk@example.com", description: "Employee's email" })
    @IsString()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: "Duk Nguyen", description: "Full name of the employee" })
    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @ApiProperty({ example: "1995-07-20", description: "Employee's birth date" })
    @IsString()
    @IsNotEmpty()
    birthDate!: string;

    @ApiProperty({ example: "Manager", description: "Position of the employee" })
    @IsString()
    @IsNotEmpty()
    position!: string;

    @ApiProperty({ example: "HR", description: "Department of the employee" })
    @IsString()
    @IsNotEmpty()
    department!: string;

    @ApiProperty({ example: "2023-05-15", description: "Start date of the employee" })
    @IsString()
    @IsNotEmpty()
    startDate!: string;

    @ApiProperty({ example: "094333346", description: "Employee's phone number" })
    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

    @ApiProperty({ example: 5000, description: "Salary of the employee", required: false })
    @IsOptional()
    @IsNumber()
    salary?: number;

    @ApiProperty({ example: "Permanent", description: "Type of contract", required: false })
    @IsOptional()
    @IsString()
    contractType?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
