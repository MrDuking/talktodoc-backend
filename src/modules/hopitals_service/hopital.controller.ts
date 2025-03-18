import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HospitalService } from "./hopital.service";
import { CreateHospitalDto, UpdateHospitalDto } from "./dtos/hopital.dto";

@ApiTags("hospitals")
@Controller("api/v1/hospitals")
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) {}

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
