import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ example: 'P001', description: 'Unique ID of the medicine' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'Paracetamol', description: 'Name of the medicine' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 5000, description: 'Price of the medicine (VND)' })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: '500mg', description: 'Dosage or quantity of the medicine' })
  @IsString()
  @IsNotEmpty()
  quantity!: string;
}

export class ImportProgressDto {
  total!: number;
  processed!: number;
  success!: number;
  errors!: { line: number; reason: string }[];
}
