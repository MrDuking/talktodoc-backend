import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsNumber, IsString } from "class-validator";

export class CreateMedicineDto {
    @ApiProperty({ example: "MD123456", description: "Mã thuốc" })
    @IsString()
    @IsOptional() // Nếu không có, sẽ tự động tạo
    id?: string;

    @ApiProperty({ example: "Paracetamol", description: "Tên thuốc" })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: "Oral", description: "Cách sử dụng", required: false })
    @IsString()
    @IsOptional()
    route?: string;

    @ApiProperty({ example: "500mg", description: "Liều lượng", required: false })
    @IsString()
    @IsOptional()
    dose?: string;

    @ApiProperty({ example: 10, description: "Số lượng", default: 0 })
    @IsNumber()
    @IsOptional()
    quantity?: number;

    @ApiProperty({ example: "Twice a day", description: "Tần suất sử dụng", required: false })
    @IsString()
    @IsOptional()
    frequency?: string;

    @ApiProperty({ example: 2, description: "Số lần cấp lại", default: 0 })
    @IsNumber()
    @IsOptional()
    refill?: number;

    @ApiProperty({ example: 100000, description: "Giá tiền (VNĐ)" })
    @IsNumber()
    @IsNotEmpty()
    finalCost!: number;

    @ApiProperty({ example: 20000, description: "Phí kê đơn", default: 0 })
    @IsNumber()
    @IsOptional()
    prescriptionFee?: number;
}

export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {}
    