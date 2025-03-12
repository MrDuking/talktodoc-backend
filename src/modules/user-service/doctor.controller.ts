import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./user.service";
import { CreateDoctorDto, UpdateDoctorDto } from "./dtos/index";
import { UserRole } from "@common/enum/user_role.enum";

@ApiTags("doctors")
@Controller("api/v1/doctors")
export class DoctorController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Get all doctors" })
    @ApiResponse({ status: 200, description: "Return all doctors." })
    @Get()
    findAllDoctors() {
        return this.usersService.getAllDoctors();
    }

    @ApiOperation({ summary: "Get a doctor by ID" })
    @ApiResponse({ status: 200, description: "Return a doctor." })
    @ApiResponse({ status: 404, description: "Doctor not found." })
    @ApiParam({ name: "id", description: "Doctor ID" })
    @Get(":id")
    findDoctorById(@Param("id") id: string) {
        return this.usersService.getDoctorById(id);
    }

    @ApiOperation({ summary: "Create a new doctor" })
    @ApiResponse({ status: 201, description: "Doctor created successfully." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiBody({ type: CreateDoctorDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
        return this.usersService.createDoctor(createDoctorDto);
    }

    @ApiOperation({ summary: "Update an existing doctor" })
    @ApiResponse({ status: 200, description: "Doctor updated successfully." })
    @ApiResponse({ status: 404, description: "Doctor not found." })
    @ApiParam({ name: "id", description: "Doctor ID" })
    @ApiBody({ type: UpdateDoctorDto })
    @Put(":id")
    updateDoctor(@Param("id") id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
        return this.usersService.updateDoctor(id, updateDoctorDto);
    }

    @ApiOperation({ summary: "Delete a doctor" })
    @ApiResponse({ status: 204, description: "Doctor deleted successfully." })
    @ApiResponse({ status: 404, description: "Doctor not found." })
    @ApiParam({ name: "id", description: "Doctor ID" })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteDoctor(@Param("id") id: string) {
        return this.usersService.deleteDoctor(id);
    }
}
