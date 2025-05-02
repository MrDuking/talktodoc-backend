import { BadRequestException, Body, Controller, Get, Param, Put } from "@nestjs/common"
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger"
import { UpdateFormConfigDto } from "./dtos/update-form-config.dto"
import { FormConfigService } from "./form-config.service"

@ApiTags("Form Config")
@Controller("form-config")
export class FormConfigController {
    constructor(private readonly formConfigService: FormConfigService) {}

    @Put(":id")
    @ApiOperation({ summary: "Update the entire form configuration (form_json)" })
    @ApiParam({ name: "id", description: "ID of the form config document in the database" })
    @ApiBody({ type: UpdateFormConfigDto })
    @ApiResponse({ status: 200, description: "Form config was successfully updated and returned" })
    @ApiResponse({ status: 400, description: "Invalid JSON format or bad request" })
    @ApiResponse({ status: 404, description: "Form config not found by given ID" })
    async update(@Param("id") id: string, @Body() dto: UpdateFormConfigDto) {
        let parsed
        try {
            parsed = JSON.parse(dto.form_json)
        } catch (e) {
            throw new BadRequestException("Invalid JSON format")
        }

        return this.formConfigService.update(id, parsed)
    }

    @Get(":id")
    @ApiOperation({ summary: "Get the form config by ID" })
    @ApiParam({ name: "id", description: "ID of the form config document" })
    @ApiResponse({ status: 200, description: "Returns the form config if found" })
    @ApiResponse({ status: 404, description: "Form config not found by given ID" })
    async getById(@Param("id") id: string) {
        return this.formConfigService.getById(id)
    }
}
