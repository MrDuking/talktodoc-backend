import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";
import { PharmacyService } from "./pharmacy.service";
import { CreatePharmacyDto, UpdatePharmacyDto } from "./dtos/pharmacy.dto";

@ApiTags("Pharmacies")
@Controller("api/v1/pharmacies")
export class PharmacyController {
    constructor(private readonly pharmacyService: PharmacyService) {}

    @ApiOperation({ summary: "Get all pharmacies" })
    @ApiResponse({ status: 200, description: "Return all pharmacies." })
    @Get()
    getAllPharmacies() {
        return this.pharmacyService.getAllPharmacies();
    }

    @ApiOperation({ summary: "Get pharmacy by ID" })
    @ApiResponse({ status: 200, description: "Return a specific pharmacy." })
    @ApiResponse({ status: 404, description: "Pharmacy not found." })
    @ApiParam({ name: "id", description: "Pharmacy ID" })
    @Get(":id")
    getPharmacyById(@Param("id") id: string) {
        return this.pharmacyService.getPharmacyById(id);
    }

    @ApiOperation({ summary: "Create a new pharmacy" })
    @ApiResponse({ status: 201, description: "Pharmacy created successfully." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiBody({ type: CreatePharmacyDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createPharmacy(@Body() createPharmacyDto: CreatePharmacyDto) {
        return this.pharmacyService.createPharmacy(createPharmacyDto);
    }

    @ApiOperation({ summary: "Update a pharmacy" })
    @ApiResponse({ status: 200, description: "Pharmacy updated successfully." })
    @ApiResponse({ status: 404, description: "Pharmacy not found." })
    @ApiParam({ name: "id", description: "Pharmacy ID" })
    @ApiBody({ type: UpdatePharmacyDto })
    @Put(":id")
    updatePharmacy(@Param("id") id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
        return this.pharmacyService.updatePharmacy(id, updatePharmacyDto);
    }

    @ApiOperation({ summary: "Delete a pharmacy" })
    @ApiResponse({ status: 204, description: "Pharmacy deleted successfully." })
    @ApiResponse({ status: 404, description: "Pharmacy not found." })
    @ApiParam({ name: "id", description: "Pharmacy ID" })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deletePharmacy(@Param("id") id: string) {
        return this.pharmacyService.deletePharmacy(id);
    }
}
