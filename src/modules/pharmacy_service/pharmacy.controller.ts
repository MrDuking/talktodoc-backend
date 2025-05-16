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
import { CreatePharmacyDto, UpdatePharmacyDto } from './dtos/pharmacy.dto'
import { PharmacyService } from './pharmacy.service'

@ApiTags('Pharmacies')
@Controller('api/v1/pharmacies')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @ApiOperation({ summary: 'Search pharmacies' })
  @ApiResponse({ status: 200, description: 'Return matching pharmacies with pagination.' })
  @ApiQuery({ name: 'query', required: false, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortField', required: false, example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'asc' })
  @Get('search')
  searchPharmacies(
    @Query('query') query: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortField') sortField: string = 'name',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return this.pharmacyService.searchPharmacies(query, page, limit, sortField, sortOrder)
  }

  @ApiOperation({ summary: 'Get all pharmacies' })
  @ApiResponse({ status: 200, description: 'Return all pharmacies.' })
  @Get()
  getAllPharmacies() {
    return this.pharmacyService.getAllPharmacies()
  }

  @ApiOperation({ summary: 'Get pharmacy by ID' })
  @ApiResponse({ status: 200, description: 'Return a specific pharmacy.' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found.' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @Get(':id')
  getPharmacyById(@Param('id') id: string) {
    return this.pharmacyService.getPharmacyById(id)
  }

  @ApiOperation({ summary: 'Create a new pharmacy' })
  @ApiResponse({ status: 201, description: 'Pharmacy created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreatePharmacyDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPharmacy(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.createPharmacy(createPharmacyDto)
  }

  @ApiOperation({ summary: 'Update a pharmacy' })
  @ApiResponse({ status: 200, description: 'Pharmacy updated successfully.' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found.' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @ApiBody({ type: UpdatePharmacyDto })
  @Put(':id')
  updatePharmacy(@Param('id') id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    console.log(updatePharmacyDto)
    console.log(id)
    return this.pharmacyService.updatePharmacy(id, updatePharmacyDto)
  }

  @ApiOperation({ summary: 'Delete a pharmacy' })
  @ApiResponse({ status: 204, description: 'Pharmacy deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Pharmacy not found.' })
  @ApiParam({ name: 'id', description: 'Pharmacy ID' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePharmacy(@Param('id') id: string) {
    return this.pharmacyService.deletePharmacy(id)
  }
}
