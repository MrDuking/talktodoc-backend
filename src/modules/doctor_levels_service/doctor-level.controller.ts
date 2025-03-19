import { Controller, Get, Param, Body, Post, Put, Delete, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";
import { DoctorLevelService } from "./doctor-level.service";
import { CreateDoctorLevelDto, UpdateDoctorLevelDto } from "./dtos/doctor-level.dto";

@ApiTags("doctor_levels")
@Controller("api/v1/doctor_levels")
export class DoctorLevelController {
    constructor(private readonly doctorLevelService: DoctorLevelService) {}

    @ApiOperation({ summary: "Search doctor levels" })
    @Get("search")
    async searchDoctorLevels(
        @Query("query") query: string,
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query("sortField") sortField: string = "name",
        @Query("sortOrder") sortOrder: "asc" | "desc" = "asc"
    ) {
        return this.doctorLevelService.searchDoctorLevels(query, page, limit, sortField, sortOrder);
    }

    @ApiOperation({ summary: "Get all doctor levels" })
    @Get()
    getAllDoctorLevels() {
        return this.doctorLevelService.getAllDoctorLevels();
    }

    @ApiOperation({ summary: "Get doctor level by ID" })
    @ApiResponse({ status: 404, description: "Doctor level not found." })
    @ApiParam({ name: "id", description: "Doctor Level ID" })
    @Get(":id")
    getDoctorLevelById(@Param("id") id: string) {
        return this.doctorLevelService.getDoctorLevelById(id);
    }

    @ApiOperation({ summary: "Create a new doctor level" })
    @ApiResponse({ status: 201, description: "Doctor level created successfully." })
    @ApiBody({ type: CreateDoctorLevelDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createDoctorLevel(@Body() createDoctorLevelDto: CreateDoctorLevelDto) {
        return this.doctorLevelService.createDoctorLevel(createDoctorLevelDto);
    }

    @ApiOperation({ summary: "Update an existing doctor level" })
    @ApiResponse({ status: 404, description: "Doctor level not found." })
    @ApiParam({ name: "id", description: "Doctor Level ID" })
    @ApiBody({ type: UpdateDoctorLevelDto })
    @Put(":id")
    updateDoctorLevel(@Param("id") id: string, @Body() updateDoctorLevelDto: UpdateDoctorLevelDto) {
        return this.doctorLevelService.updateDoctorLevel(id, updateDoctorLevelDto);
    }

    @ApiOperation({ summary: "Delete a doctor level" })
    @ApiResponse({ status: 404, description: "Doctor level not found." })
    @ApiParam({ name: "id", description: "Doctor Level ID" })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteDoctorLevel(@Param("id") id: string) {
        return this.doctorLevelService.deleteDoctorLevel(id);
    }
}
