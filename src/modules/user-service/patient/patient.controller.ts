import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../user.service";
import { CreatePatientDto, UpdatePatientDto } from "../dtos/index";
import { UserRole } from "@common/enum/user_role.enum";

@ApiTags("patients")
@Controller("api/v1/patients")
export class PatientController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Get all patients" })
    @ApiResponse({ status: 200, description: "Return all patients." })
    @Get()
    findAllPatients() {
        return this.usersService.getAllPatients();
    }

    @ApiOperation({ summary: "Get a patient by ID" })
    @ApiResponse({ status: 200, description: "Return a patient." })
    @ApiResponse({ status: 404, description: "Patient not found." })
    @ApiParam({ name: "id", description: "Patient ID" })
    @Get(":id")
    findPatientById(@Param("id") id: string) {
        return this.usersService.getPatientById(id);
    }

    @ApiOperation({ summary: "Create a new patient" })
    @ApiResponse({ status: 201, description: "Patient created successfully." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiBody({ type: CreatePatientDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createPatient(@Body() createPatientDto: CreatePatientDto) {
        return this.usersService.createPatient(createPatientDto);
    }

    @ApiOperation({ summary: "Update an existing patient" })
    @ApiResponse({ status: 200, description: "Patient updated successfully." })
    @ApiResponse({ status: 404, description: "Patient not found." })
    @ApiParam({ name: "id", description: "Patient ID" })
    @ApiBody({ type: UpdatePatientDto })
    @Put(":id")
    updatePatient(@Param("id") id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.usersService.updatePatient(id, updatePatientDto);
    }

    @ApiOperation({ summary: "Delete a patient" })
    @ApiResponse({ status: 204, description: "Patient deleted successfully." })
    @ApiResponse({ status: 404, description: "Patient not found." })
    @ApiParam({ name: "id", description: "Patient ID" })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deletePatient(@Param("id") id: string) {
        return this.usersService.deletePatient(id);
    }
}
