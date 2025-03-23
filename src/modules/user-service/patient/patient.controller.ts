import { Controller, Get, Query, Param, Body, Post, Put, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../user.service";
import { CreatePatientDto, UpdatePatientDto } from "../dtos/index";

@ApiTags("patients")
@Controller("api/v1/patients")
export class PatientController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Search patients" })
    @Get("search")
    searchPatients(
        @Query("query") query: string = "",
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query("sortField") sortField: string = "name",
        @Query("sortOrder") sortOrder: "asc" | "desc" = "asc"
    ) {
        return this.usersService.searchPatients(query, page, limit, sortField, sortOrder);
    }

    @ApiOperation({ summary: "Get all patients" })
    @Get()
    findAllPatients() {
        return this.usersService.getAllPatients();
    }

    @ApiOperation({ summary: "Get a patient by MongoDB _id" })
    @ApiParam({ name: "_id", description: "Patient MongoDB _id" })
    @Get(":_id")
    findPatientById(@Param("_id") id: string) {
        return this.usersService.getPatientById(id);
    }

    @ApiOperation({ summary: "Create a new patient" })
    @ApiBody({ type: CreatePatientDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createPatient(@Body() createPatientDto: CreatePatientDto) {
        return this.usersService.createPatient(createPatientDto);
    }

    @ApiOperation({ summary: "Update an existing patient by _id" })
    @ApiParam({ name: "_id", description: "Patient MongoDB _id" })
    @ApiBody({ type: UpdatePatientDto })
    @Put(":_id")
    updatePatient(@Param("_id") id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.usersService.updatePatient(id, updatePatientDto);
    }

    @ApiOperation({ summary: "Delete a patient by _id" })
    @ApiParam({ name: "_id", description: "Patient MongoDB _id" })
    @Delete(":_id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deletePatient(@Param("_id") id: string) {
        return this.usersService.deletePatient(id);
    }
}
