import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./user.service";
import { CreateEmployeeDto, UpdateEmployeeDto } from "./dtos/index";
import { UserRole } from "@common/enum/user_role.enum";

@ApiTags("employees")
@Controller("api/v1/employees")
export class EmployeeController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Get all employees" })
    @ApiResponse({ status: 200, description: "Return all employees." })
    @Get()
    getAllEmployees() {
        return this.usersService.getAllEmployees();
    }

    @ApiOperation({ summary: "Get an employee by ID" })
    @ApiResponse({ status: 200, description: "Return employee details." })
    @ApiResponse({ status: 404, description: "Employee not found." })
    @ApiParam({ name: "id", description: "Employee ID" })
    @Get(":id")
    getEmployeeById(@Param("id") id: string) {
        return this.usersService.getEmployeeById(id);
    }

    @ApiOperation({ summary: "Create a new employee" })
    @ApiResponse({ status: 201, description: "Employee created successfully." })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiBody({ type: CreateEmployeeDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.usersService.createEmployee(createEmployeeDto);
    }

    @ApiOperation({ summary: "Update an existing employee" })
    @ApiResponse({ status: 200, description: "Employee updated successfully." })
    @ApiResponse({ status: 404, description: "Employee not found." })
    @ApiParam({ name: "id", description: "Employee ID" })
    @ApiBody({ type: UpdateEmployeeDto })
    @Put(":id")
    updateEmployee(@Param("id") id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.usersService.updateEmployee(id, updateEmployeeDto);
    }

    @ApiOperation({ summary: "Delete an employee" })
    @ApiResponse({ status: 204, description: "Employee deleted successfully." })
    @ApiResponse({ status: 404, description: "Employee not found." })
    @ApiParam({ name: "id", description: "Employee ID" })
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteEmployee(@Param("id") id: string) {
        return this.usersService.deleteEmployee(id);
    }
}
