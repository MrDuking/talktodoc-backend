import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { UserRole } from "@common/enum/user_role.enum";

export class CreateAdminDto {
    @ApiProperty({ example: "admin1", description: "Username for the admin" })
    @IsString()
    @IsNotEmpty()
    username!: string;

    @ApiProperty({ example: "password123", description: "Password for the admin" })
    @IsString()
    @MinLength(6)
    password!: string;

    @ApiProperty({ example: "admin@example.com", description: "Admin's email" })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    // @ApiProperty({ example: UserRole.ADMIN, description: "Role of the admin", default: UserRole.ADMIN })
    // @IsString()
    // role: UserRole = UserRole.ADMIN;

    @ApiProperty({ example: "Admin Name", description: "Full name of the admin" })
    @IsString()
    @IsNotEmpty()
    fullName!: string;
}

export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
