import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import * as mongoose from 'mongoose'
import { CreatePatientDto, UpdatePatientDto } from '../dtos/index'
import { Patient } from '../schemas/patient.schema'
import { UsersService } from '../user.service'

@ApiTags('patients')
@Controller('api/v1/patients')
export class PatientController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Search patients' })
  @ApiResponse({ status: 200, description: 'Return matching patients with pagination.' })
  @ApiQuery({ name: 'query', required: false, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortField', required: false, example: 'name' })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false, example: 'asc' })
  @Get('search')
  async searchPatients(
    @Query('query') query: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortField') sortField: string = 'name',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return await this.usersService.searchPatients(query, page, limit, sortField, sortOrder)
  }

  @ApiOperation({ summary: 'Get all patients' })
  @Get()
  findAllPatients(): Promise<Patient[]> {
    return this.usersService.getAllPatients()
  }

  @ApiOperation({ summary: 'Get a patient by MongoDB _id' })
  @ApiParam({ name: '_id', description: 'Patient MongoDB _id' })
  @Get(':_id')
  findPatientById(@Param('_id') id: string): Promise<Patient> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid patient ID format')
    return this.usersService.getPatientById(id)
  }

  @ApiOperation({ summary: 'Create a new patient' })
  @ApiBody({ type: CreatePatientDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPatient(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    return this.usersService.createPatient(createPatientDto)
  }

  @ApiOperation({ summary: 'Update an existing patient by _id' })
  @ApiParam({ name: '_id', description: 'Patient MongoDB _id' })
  @ApiBody({ type: UpdatePatientDto })
  @Put(':_id')
  updatePatient(
    @Param('_id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    return this.usersService.updatePatient(id, updatePatientDto)
  }

  @ApiOperation({ summary: 'Delete a patient by _id' })
  @ApiParam({ name: '_id', description: 'Patient MongoDB _id' })
  @Delete(':_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePatient(@Param('_id') id: string): Promise<void> {
    return this.usersService.deletePatient(id)
  }
}
