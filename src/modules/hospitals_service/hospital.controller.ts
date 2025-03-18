import { Controller, Get, Query, Param, Body, Post, Put, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HospitalService } from "./hospital.service";
import { CreateHospitalDto, UpdateHospitalDto } from "./dtos/hospital.dto";

@ApiTags("hospitals")
@Controller("api/v1/hospitals")
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) {}

    @ApiOperation({ summary: "Search hospitals" })
    @ApiResponse({ status: 200, description: "Return matching hospitals with pagination." })
    @ApiQuery({ name: "query", required: false, description: "Search term" })
    @ApiQuery({ name: "page", required: false, example: 1 })
    @ApiQuery({ name: "limit", required: false, example: 10 })
    @ApiQuery({ name: "sortField", required: false, example: "name" })
    @ApiQuery({ name: "sortOrder", required: false, example: "asc" })
    @Get("search")
    searchHospitals(
        @Query("query") query: string = "",
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query("sortField") sortField: string = "name",
        @Query("sortOrder") sortOrder: "asc" | "desc" = "asc"
    ) {
        return this.hospitalService.searchHospitals(query, page, limit, sortField, sortOrder);
    }

    @ApiOperation({ summary: "Get all hospitals" })
    @ApiResponse({ status: 200, description: "Return all hospitals." })
    @Get()
    getAllHospitals() {
        return this.hospitalService.getAllHospitals();
    }

    @ApiOperation({ summary: "Get hospital by ID" })
    @ApiResponse({ status: 200, description: "Return hospital details." })
    @ApiResponse({ status: 404, description: "Hospital not found." })
    @ApiParam({ name: "id", description: "Hospital ID" })
    @Get(":id")
    getHospitalById(@Param("id") id: string) {
        return this.hospitalService.getHospitalById(id);
    }

    @ApiOperation({ summary: "Create a new hospital" })
    @ApiResponse({ status: 201, description: "Hospital created successfully." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiBody({ type: CreateHospitalDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createHospital(@Body() createHospitalDto: CreateHospitalDto) {
        return this.hospitalService.createHospital(createHospitalDto);
    }

    @ApiOperation({ summary: "Update an existing hospital" })
    @ApiResponse({ status: 200, description: "Hospital updated successfully." })
    @ApiResponse({ status: 404, description: "Hospital not found." })
    @ApiParam({ name: "id", description: "Hospital ID" })
    @ApiBody({ type: UpdateHospitalDto })
    @Put(":id")
    updateHospital(@Param("id") id: string, @Body() updateHospitalDto: UpdateHospitalDto) {
        return this.hospitalService.updateHospital(id, updateHospitalDto);
    }

    @ApiOperation({ summary: "Delete a hospital" })
    @ApiResponse({ status: 204, description: "Hospital deleted successfully." })
    @ApiResponse({ status: 404, description: "Hospital not found." })
    @ApiParam({ name: "id", description: "Hospital ID" })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteHospital(@Param("id") id: string) {
        return this.hospitalService.deleteHospital(id);
    }
}
