import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common"
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CreateSpecialityDto, UpdateSpecialityDto } from "./dtos/index"
import { UsersService } from "./user.service"

@ApiTags("specialities")
@Controller("api/v1/specialities")
export class SpecialityController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Get all specialities" })
    @ApiResponse({ status: 200, description: "Return all specialities." })
    @Get()
    findAllSpecialities() {
        return this.usersService.getAllSpecialities()
    }

    @ApiOperation({ summary: "Create a new speciality" })
    @ApiResponse({ status: 201, description: "Speciality created successfully." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiBody({ type: CreateSpecialityDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createSpeciality(@Body() createSpecialityDto: CreateSpecialityDto) {
        return this.usersService.createSpeciality(createSpecialityDto)
    }

    @ApiOperation({ summary: "Update an existing speciality" })
    @ApiResponse({ status: 200, description: "Speciality updated successfully." })
    @ApiResponse({ status: 404, description: "Speciality not found." })
    @ApiParam({ name: "id", description: "Speciality ID" })
    @Put(":id")
    updateSpeciality(@Param("id") id: string, @Body() updateSpecialityDto: UpdateSpecialityDto) {
        return this.usersService.updateSpeciality(id, updateSpecialityDto)
    }

    @ApiOperation({ summary: "Delete a speciality" })
    @ApiResponse({ status: 204, description: "Speciality deleted successfully." })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteSpeciality(@Param("id") id: string) {
        return this.usersService.deleteSpeciality(id)
    }
}
