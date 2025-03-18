import { Controller, Get, Query, Param, Body, Post, Put, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SpecialityService } from "./speciality.service";
import { CreateSpecialityDto, UpdateSpecialityDto } from "./dtos/speciality.dto";

@ApiTags("specialities")
@Controller("api/v1/specialities")
export class SpecialityController {
    constructor(private readonly specialityService: SpecialityService) {}

    @ApiOperation({ summary: "Search specialities" })
    @ApiResponse({ status: 200, description: "Return matching specialities with pagination." })
    @ApiQuery({ name: "query", required: false, description: "Search term" })
    @ApiQuery({ name: "page", required: false, example: 1 })
    @ApiQuery({ name: "limit", required: false, example: 10 })
    @ApiQuery({ name: "sortField", required: false, example: "name" })
    @ApiQuery({ name: "sortOrder", required: false, example: "asc" })
    @Get("search")
    searchSpecialities(
        @Query("query") query: string = "",
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query("sortField") sortField: string = "name",
        @Query("sortOrder") sortOrder: "asc" | "desc" = "asc"
    ) {
        return this.specialityService.searchSpecialities(query, page, limit, sortField, sortOrder);
    }

    @ApiOperation({ summary: "Get all specialities" })
    @ApiResponse({ status: 200, description: "Return all specialities." })
    @Get()
    getAllSpecialities() {
        return this.specialityService.getAllSpecialities();
    }

    @ApiOperation({ summary: "Get speciality by ID" })
    @ApiResponse({ status: 200, description: "Return speciality details." })
    @ApiResponse({ status: 404, description: "Speciality not found." })
    @ApiParam({ name: "id", description: "Speciality ID" })
    @Get(":id")
    getSpecialityById(@Param("id") id: string) {
        return this.specialityService.getSpecialityById(id);
    }

    @ApiOperation({ summary: "Create a new speciality" })
    @ApiResponse({ status: 201, description: "Speciality created successfully." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiBody({ type: CreateSpecialityDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createSpeciality(@Body() createSpecialityDto: CreateSpecialityDto) {
        return this.specialityService.createSpeciality(createSpecialityDto);
    }

    @ApiOperation({ summary: "Update an existing speciality" })
    @ApiResponse({ status: 200, description: "Speciality updated successfully." })
    @ApiResponse({ status: 404, description: "Speciality not found." })
    @ApiParam({ name: "id", description: "Speciality ID" })
    @ApiBody({ type: UpdateSpecialityDto })
    @Put(":id")
    updateSpeciality(@Param("id") id: string, @Body() updateSpecialityDto: UpdateSpecialityDto) {
        return this.specialityService.updateSpeciality(id, updateSpecialityDto);
    }

    @ApiOperation({ summary: "Delete a speciality" })
    @ApiResponse({ status: 204, description: "Speciality deleted successfully." })
    @ApiResponse({ status: 404, description: "Speciality not found." })
    @ApiParam({ name: "id", description: "Speciality ID" })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteSpeciality(@Param("id") id: string) {
        return this.specialityService.deleteSpeciality(id);
    }
}
