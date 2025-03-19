import { Controller, Get, Query, Param, Body, Post, Put, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../user.service";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/index";

@ApiTags("employees")
@Controller("api/v1/employees")
export class EmployeeController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Search employees" })
    @ApiResponse({ status: 200, description: "Return matching employees with pagination." })
    @ApiQuery({ name: "query", required: false, description: "Search term" })
    @ApiQuery({ name: "page", required: false, example: 1 })
    @ApiQuery({ name: "limit", required: false, example: 10 })
    @ApiQuery({ name: "sortField", required: false, example: "name" })
    @ApiQuery({ name: "sortOrder", required: false, example: "asc" })
    @Get("search")
    searchEmployees(
        @Query("query") query: string = "",
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query("sortField") sortField: string = "name",
        @Query("sortOrder") sortOrder: "asc" | "desc" = "asc"
    ) {
        return this.usersService.searchEmployees(query, page, limit, sortField, sortOrder);
    }

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
