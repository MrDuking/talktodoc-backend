import {
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
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dtos/specialty.dto'
import { Specialty } from './schemas/specialty.schema'
import { SpecialtyService } from './specialty.service'

@ApiTags('Specialties')
@Controller('api/v1/Specialties')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @ApiOperation({ summary: 'Search Specialties' })
  @ApiResponse({ status: 200, description: 'Return matching Specialties with pagination.' })
  @ApiQuery({ name: 'query', required: false, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortField', required: false, example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'asc' })
  @Get('search')
  searchSpecialties(
    @Query('query') query: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortField') sortField: string = 'name',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ total: number; page: number; limit: number; data: Specialty[] }> {
    return this.specialtyService.searchSpecialties(query, page, limit, sortField, sortOrder)
  }

  @ApiOperation({ summary: 'Get all Specialties' })
  @ApiResponse({ status: 200, description: 'Return all Specialties.' })
  @Get()
  getAllSpecialties(): Promise<Specialty[]> {
    return this.specialtyService.getAllSpecialties()
  }

  @ApiOperation({ summary: 'Get specialty by ID' })
  @ApiResponse({ status: 200, description: 'Return specialty details.' })
  @ApiResponse({ status: 404, description: 'Specialty not found.' })
  @ApiParam({ name: 'id', description: 'Specialty ID' })
  @Get(':id')
  getSpecialtyById(@Param('id') id: string): Promise<Specialty> {
    return this.specialtyService.getSpecialtyById(id)
  }

  @ApiOperation({ summary: 'Create a new specialty' })
  @ApiResponse({ status: 201, description: 'Specialty created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateSpecialtyDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSpecialty(@Body() createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    return this.specialtyService.createSpecialty(createSpecialtyDto)
  }

  @ApiOperation({ summary: 'Update an existing specialty' })
  @ApiResponse({ status: 200, description: 'Specialty updated successfully.' })
  @ApiResponse({ status: 404, description: 'Specialty not found.' })
  @ApiParam({ name: 'id', description: 'Specialty ID' })
  @ApiBody({ type: UpdateSpecialtyDto })
  @Put(':id')
  updateSpecialty(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<Specialty> {
    return this.specialtyService.updateSpecialty(id, updateSpecialtyDto)
  }

  @ApiOperation({ summary: 'Delete a specialty' })
  @ApiResponse({ status: 204, description: 'Specialty deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Specialty not found.' })
  @ApiParam({ name: 'id', description: 'Specialty ID' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSpecialty(@Param('id') id: string): Promise<void> {
    return this.specialtyService.deleteSpecialty(id)
  }
}
